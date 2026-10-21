::: {align="center"}
# 🔬 ResearchMind

### Multi-Agent AI Research Assistant

**Turn a research question into a structured report with a team of
specialized AI agents.**

[![Live
Demo](https://img.shields.io/badge/Live%20Demo-Open%20App-6C5CE7?style=for-the-badge)](https://researchmind-multi-agent-ai.onrender.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/AI-LangChain-1C3C3C?style=for-the-badge)](https://www.langchain.com/)
:::

------------------------------------------------------------------------

## 📌 Overview

**ResearchMind** is a web-based, multi-agent AI research assistant built
with **LangChain, Mistral AI, Tavily, and FastAPI**.

Instead of asking one model to handle the entire task, ResearchMind
separates the workflow into specialized stages. The agents search for
relevant sources, extract useful information, draft a structured report,
and review the result.

🌐 **Live application:**
[researchmind-multi-agent-ai.onrender.com](https://researchmind-multi-agent-ai.onrender.com/)\
💻 **Source code:** [GitHub
repository](https://github.com/RisabhPandey/ResearchMind-Multi-Agent-AI)

## ✨ Features

-   🔎 **Web research:** Find relevant web sources using Tavily.
-   📖 **Source reading:** Retrieve and extract useful content from
    selected web pages.
-   ✍️ **Report generation:** Turn gathered information into a
    structured research report.
-   🧐 **AI critique:** Review the report and provide quality feedback.
-   🔄 **Multi-agent workflow:** Follow progress across the Search,
    Reader, Writer, and Critic stages.
-   📄 **Exportable results:** Copy the report or download it as a
    Markdown file.
-   🌐 **Web interface:** Use the application through a browser.
-   ☁️ **Cloud deployment:** Hosted on Render.

## 🧠 How It Works

``` text
                ┌──────────────────────┐
                │      User Query      │
                └──────────┬───────────┘
                           ▼
                ┌──────────────────────┐
                │     Search Agent     │
                │  Tavily web search   │
                └──────────┬───────────┘
                           ▼
                ┌──────────────────────┐
                │     Reader Agent     │
                │ Extract source text  │
                └──────────┬───────────┘
                           ▼
                ┌──────────────────────┐
                │        Writer        │
                │ Draft research report│
                └──────────┬───────────┘
                           ▼
                ┌──────────────────────┐
                │        Critic        │
                │ Review report quality│
                └──────────┬───────────┘
                           ▼
                ┌──────────────────────┐
                │ Final Report + Review│
                └──────────────────────┘
```

### Agent responsibilities

  -----------------------------------------------------------------------
  Stage                               Responsibility
  ----------------------------------- -----------------------------------
  **Search Agent**                    Searches the web for relevant
                                      sources.

  **Reader Agent**                    Reads selected pages and extracts
                                      useful information.

  **Writer**                          Creates a clear, structured report
                                      from the collected research.

  **Critic**                          Evaluates the report and returns
                                      feedback on its quality.
  -----------------------------------------------------------------------

The output depends on the relevance of retrieved sources, model
responses, and the availability of the external APIs. AI-generated
research should be verified before it is used for important decisions.

## 🛠️ Tech Stack

  Technology                  Purpose
  --------------------------- ---------------------------------------------------
  **Python**                  Core application language
  **FastAPI**                 Backend API and web server
  **LangChain**               Agent and LLM workflow orchestration
  **Mistral AI**              Language model for research and report generation
  **Tavily API**              Web search
  **Requests**                HTTP requests for source retrieval
  **BeautifulSoup**           HTML parsing and text extraction
  **HTML, CSS, JavaScript**   Frontend interface
  **Render**                  Application hosting

## 🗂️ Project Structure

``` text
ResearchMind-Multi-Agent-AI/
├── static/
│   ├── index.html       # Web interface
│   ├── style.css        # UI styling
│   └── app.js           # Frontend behavior and API interaction
├── agents.py            # Search/reader agents and writer/critic chains
├── tools.py             # Tavily search and web-page scraping tools
├── pipeline.py          # Research pipeline logic
├── server.py            # FastAPI application and API endpoints
├── requirements.txt     # Python dependencies
├── .gitignore           # Files excluded from Git
└── README.md            # Project documentation
```

## 🚀 Run Locally

### 1. Prerequisites

-   Python installed
-   A [Mistral AI API key](https://console.mistral.ai/)
-   A [Tavily API key](https://app.tavily.com/)

### 2. Clone the repository

``` bash
git clone https://github.com/RisabhPandey/ResearchMind-Multi-Agent-AI.git
cd ResearchMind-Multi-Agent-AI
```

### 3. Create and activate a virtual environment

**Windows --- PowerShell**

``` powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux**

``` bash
python3 -m venv .venv
source .venv/bin/activate
```

### 4. Install dependencies

``` bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Configure environment variables

Create a file named `.env` in the project root:

``` env
MISTRAL_API_KEY=your_mistral_api_key
TAVILY_API_KEY=your_tavily_api_key
```

Replace the example values with your own keys. **Never commit `.env` or
expose API keys in source code, screenshots, or public repositories.**

### 6. Start the application

``` bash
uvicorn server:app --host 127.0.0.1 --port 8000 --reload
```

Open <http://127.0.0.1:8000> in your browser.

## 🔌 API Endpoints

  -----------------------------------------------------------------------
  Method                  Endpoint                Description
  ----------------------- ----------------------- -----------------------
  `GET`                   `/`                     Serves the web
                                                  application.

  `GET`                   `/api/health`           Returns a health status
                                                  response.

  `POST`                  `/api/research`         Starts the research
                                                  workflow and streams
                                                  progress/results to the
                                                  frontend.
  -----------------------------------------------------------------------

FastAPI also provides interactive API documentation at `/docs` when
running locally.

## ☁️ Deployment

The application is deployed on **Render**.

1.  Push the project to GitHub.

2.  Create a new **Web Service** in Render and connect the repository.

3.  Set the build command:

    ``` bash
    pip install -r requirements.txt
    ```

4.  Set the start command:

    ``` bash
    uvicorn server:app --host 0.0.0.0 --port $PORT
    ```

5.  Add these environment variables in Render's **Environment**
    settings:

    -   `MISTRAL_API_KEY`
    -   `TAVILY_API_KEY`

6.  Deploy the service and open the generated URL.

> **Note:** Render's free instances may spin down after inactivity, so
> the first request can take longer while the service starts. API usage
> may also be subject to provider limits and availability.

## 🔐 Security Notes

-   Keep API keys in environment variables, not in Git.
-   Ensure `.env` is included in `.gitignore`.
-   Do not expose secret values in logs or frontend JavaScript.
-   Treat generated reports as AI-assisted research and verify important
    claims against original sources.

## 🗺️ Possible Future Improvements

-   Add source citations and direct references throughout the final
    report.
-   Support multiple report formats, such as PDF and DOCX.
-   Add research history and saved reports.
-   Add configurable research depth and source limits.
-   Add automated evaluation tests for report quality and source
    relevance.
-   Improve retries, timeouts, and user-facing error handling for
    external API failures.

## 🤝 Contributing

Suggestions, bug reports, and improvements are welcome. Feel free to
open an issue or submit a pull request in the [GitHub
repository](https://github.com/RisabhPandey/ResearchMind-Multi-Agent-AI).

## 📄 License

No license is specified in this README. If you plan to accept reuse or
contributions publicly, consider adding a `LICENSE` file that matches
how you want others to use the project.

------------------------------------------------------------------------

::: {align="center"}
**Built to explore the potential of agentic AI and automated research.**

If you find ResearchMind useful, consider giving the repository a ⭐ on
GitHub.
:::
