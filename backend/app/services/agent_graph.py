from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END

from app.services.vector_store import query_similar
from app.services.rag_utils import build_context


class AgentState(TypedDict):
    question: str
    user_id: int
    conversation_id: str
    chunks: List[Dict[str, Any]]
    context: str
    answer: str
    sources: List[Dict[str, Any]]
    route: str
    analysis_type: str


def router_agent(state: AgentState) -> AgentState:
    question = state["question"].lower()

    if any(word in question for word in ["summarize", "summary", "key takeaways", "main risks", "risk"]):
        state["route"] = "analysis"
    else:
        state["route"] = "rag"

    print(f"Router Agent route: {state['route']}", flush=True)
    return state


def retrieval_agent(state: AgentState) -> AgentState:
    chunks = query_similar(
        state["question"],
        user_id=state["user_id"],
        n_results=5,
    )

    state["chunks"] = chunks
    state["context"] = build_context(chunks)

    print(f"Retrieval Agent found {len(chunks)} chunks", flush=True)
    return state


def analysis_agent(state: AgentState) -> AgentState:

    question = state["question"].lower()

    if "risk" in question:
        state["analysis_type"] = "risk_analysis"

    elif any(word in question for word in [
        "summarize",
        "summary",
        "key takeaways"
    ]):
        state["analysis_type"] = "summary"

    else:
        state["analysis_type"] = "standard_qa"

    print(
        f"Analysis Agent type: {state['analysis_type']}",
        flush=True
    )

    return state


def safety_agent(state: AgentState) -> AgentState:
    if not state["chunks"]:
        state["answer"] = "I don't have enough information in the uploaded documents to answer that."

    print("Safety Agent check complete", flush=True)
    return state


def build_agent_graph():
    graph = StateGraph(AgentState)

    graph.add_node("router_agent", router_agent)
    graph.add_node("retrieval_agent", retrieval_agent)
    graph.add_node("analysis_agent", analysis_agent)
    graph.add_node("safety_agent", safety_agent)

    graph.set_entry_point("router_agent")
    graph.add_edge("router_agent", "retrieval_agent")
    graph.add_edge("retrieval_agent", "analysis_agent")
    graph.add_edge("analysis_agent", "safety_agent")
    graph.add_edge("safety_agent", END)

    return graph.compile()


agent_graph = build_agent_graph()