from agents import build_search_agent, build_reader_agent, writer_chain, critic_chain

def run_research_pipeline(topic: str) -> dict:
    state = {}

    # Step-1- Search Agent Working
    print("\n"+"= "*50)
    print("Step-1 - Sreach Agent is Working...\n")
    print("="*50)

    search_agent = build_search_agent()
    search_result = search_agent.invoke({
        "messages" : [('user',f'Find recent, relaible & detailed information about: {topic}')]
    })

    state['search_result'] = search_result['messages'][-1].content

    print('\n Search Result ',state['search_result'])


    # Step-2 - Reader Agent
    print("\n"+"= "*50)
    print("Step-2 - Reader Agent is scraping top resources...\n")
    print("="*50)

    reader_agent = build_reader_agent()
    reader_result = reader_agent.invoke({
        "messages": [("user",
                      f"Based on the following search results about '{topic}',"
                      f"Pick the most relevent URL & scrape it for deeper content. \n\n"
                      f"Search Result:\n {state['search_result'][:800]}"
                    )]
    })

    state['scraped_content'] = reader_result['messages'][-1].content

    print("\n Screaped Content: \n",state['scraped_content'])


    # Srep-3 - Writer Chain 
    print("\n"+"= "*50)
    print("Step-3 - Writer is drafting a report...\n")
    print("="*50)

    research_combined = (
        f"Search Results: \n {state['search_result']} \n\n"
        f"Detailed Scraped Content: \n {state['scraped_content']}"
    )

    state['report'] = writer_chain.invoke({
        "topic" : topic,
        "research" : research_combined
    })

    print("\n Final Report \n",state['report'])


    # Step-4 Critic Report
    print("\n"+"= "*50)
    print("Step-4 - Critic is reviewing the report...\n")
    print("="*50)

    state["feedback"] = critic_chain.invoke({
        "report" : state['report']
    })

    print("\n Critic Report: \n",state["feedback"])

    return state


if __name__ == "__main__":
    topic = input("\n Enter Research Topic: ")
    run_research_pipeline(topic)

