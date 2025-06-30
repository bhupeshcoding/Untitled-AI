import arxiv
import json
import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

def search_papers(query: str, max_results: int = 5) -> List[dict]:
    """
    Search arXiv papers by query and return list of papers.
    """
    search = arxiv.Search(
        query=query,
        max_results=max_results,
        sort_by=arxiv.SortCriterion.Relevance
    )
    client = arxiv.Client()

    papers = []
    for result in client.results(search):
        papers.append({
            "title": result.title,
            "id": result.entry_id.split('/')[-1],
            "authors": [author.name for author in result.authors],
            "summary": result.summary,
            "published": result.published.strftime("%Y-%m-%d")
        })
    return papers

def extract_info(paper_id: str) -> dict:
    """
    Get paper information from arXiv and generate a structured summary.
    """
    try:
        # Search for the specific paper
        search = arxiv.Search(
            id_list=[paper_id],
            max_results=1
        )
        client = arxiv.Client()
        paper = next(client.results(search))
        
        # Create a structured summary
        summary = {
            "problem": "This paper addresses " + paper.summary[:600] + "...",
            "method": "The researchers approached this by " + paper.summary[200:600] + "...",
            "findings": "Key findings include " + paper.summary[400:600] + "...",
            "application": "This research can be applied to improve understanding of " + paper.title
        }
        
        return summary
    except StopIteration:
        return {
            "error": f"Paper with ID {paper_id} not found"
        }
    except Exception as e:
        return {
            "error": f"Error processing paper: {str(e)}"
        }

if __name__ == "__main__":
    # Example usage
    papers = search_papers("machine learning")
    print(json.dumps(papers, indent=2))
    
    # Example paper summary
    summary = extract_info("2301.12345")
    print(json.dumps(summary, indent=2))