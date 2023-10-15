# fastapi server
# run with: uvicorn main:app --reload


from fastapi import FastAPI
from transformers import pipeline

from langdetect import detect, LangDetectException
from sentence_transformers import SentenceTransformer
import pickle
import numpy as np

# load zero-shot-classification model for classification
classifier_model = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    revision="c626438",
    device="mps",
)
# possible classification labels
classifier_labels = [
    "Book",
    "Positive",
    "Gratitude",
    "Question",
    "Negative",
    "New Video",
]
# load sentence transformer model for embedding
embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
# load saved kmeans model
kmeans_model = pickle.load(open("kmeans.pkl", "rb"))

app = FastAPI()


# language detection function
def detect_lang(text):
    try:
        return detect(text)
    except LangDetectException:
        return "unknown"


@app.get("/")
def read_root():
    return {"Hello": "World"}


# health endpoint returns a 200 status code
@app.get("/health")
def health():
    return {"status": "ok"}


# predict endpoint takes a text as input in the request body and returns a string classification
@app.post("/predict")
def predict(text: str):
    # check if text is in english
    if detect_lang(text) == "en":
        # get embedding
        embedding = embedding_model.encode(text)
        # get cluster
        cluster = kmeans_model.predict(
            np.array(embedding, dtype="float").reshape(1, -1)
        )[0]

        # if cluster is not 1, return label as irrelevant
        if cluster != 1:
            return {"label": "irrelevant", "cluster": str(cluster)}

        # perform classification
        classification = classifier_model(text, classifier_labels)

        scores = classification["scores"]
        output_labels = classification["labels"]

        # find index of highest score
        highest_score_index = scores.index(max(scores))

        # return label with highest score
        return {
            "label": output_labels[highest_score_index],
            "cluster": str(cluster),
        }
    else:
        return {"label": "not english", "cluster": "not english"}
