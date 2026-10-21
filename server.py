import asyncio
import json
import os


from fastapi import FastAPI
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from agents import build_search_agent, build_reader_agent, writer_chain, critic_chain

app = FastAPI(title="Research Mind - Multi Agent Research")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class ResearchRequest(BaseModel):
    topic: str


def sse(event: str, data: dict) -> str:
    """Format a Server-Sent Event."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


# ---- blocking pipeline steps (run in worker threads) ----
def step_search(topic: str) -> str:
    agent = build_search_agent()
    result = agent.invoke({
        "messages": [("user", f"Find recent, reliable & detailed information about: {topic}")]
    })
    return result["messages"][-1].content


def step_read(topic: str, search_result: str) -> str:
    agent = build_reader_agent()
    result = agent.invoke({
        "messages": [("user",
                      f"Based on the following search results about '{topic}', "
                      f"Pick the most relevant URL & scrape it for deeper content.\n\n"
                      f"Search Result:\n {search_result[:800]}")]
    })
    return result["messages"][-1].content


def step_write(topic: str, search_result: str, scraped: str) -> str:
    research = (
        f"Search Results: \n {search_result} \n\n"
        f"Detailed Scraped Content: \n {scraped}"
    )
    return writer_chain.invoke({"topic": topic, "research": research})


def step_critic(report: str) -> str:
    return critic_chain.invoke({"report": report})


# ---- routes ----
@app.get("/")
def index():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/research")
async def research(req: ResearchRequest):
    topic = req.topic.strip()

    async def event_stream():
        if not topic:
            yield sse("error", {"message": "Please enter a topic."})
            return
        try:
            yield sse("step", {"step": 1, "status": "running"})
            search_result = await asyncio.to_thread(step_search, topic)
            yield sse("step", {"step": 1, "status": "done", "content": search_result})

            yield sse("step", {"step": 2, "status": "running"})
            scraped = await asyncio.to_thread(step_read, topic, search_result)
            yield sse("step", {"step": 2, "status": "done", "content": scraped})

            yield sse("step", {"step": 3, "status": "running"})
            report = await asyncio.to_thread(step_write, topic, search_result, scraped)
            yield sse("step", {"step": 3, "status": "done", "content": report})

            yield sse("step", {"step": 4, "status": "running"})
            feedback = await asyncio.to_thread(step_critic, report)
            yield sse("step", {"step": 4, "status": "done", "content": feedback})

            yield sse("complete", {"message": "Research complete"})
        except Exception as e:
            yield sse("error", {"message": f"{type(e).__name__}: {e}"})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)