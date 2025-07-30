from langchain_community.llms import LlamaCpp

def load_llm(model_path: str):
    llm = LlamaCpp(
        model_path=model_path,
        temperature=0.5,
        max_tokens=512,
        top_p=1,
        n_ctx=2048,
        n_batch=64,
        verbose=False
    )
    return llm
