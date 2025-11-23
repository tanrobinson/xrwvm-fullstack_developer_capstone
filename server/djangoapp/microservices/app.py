"""
This module contains a Flask application for sentiment analysis.
"""

import json

from flask import Flask
from nltk.sentiment import SentimentIntensityAnalyzer

app = Flask("Sentiment Analyzer")

sia = SentimentIntensityAnalyzer()


@app.get("/")
def home():
    """
    This function returns a welcome message.
    """
    return "Welcome to the Sentiment Analyzer. \
    Use /analyze/text to get the sentiment"


@app.get("/analyze/<input_txt>")
def analyze_sentiment(input_txt):
    """
    This function analyzes the sentiment of the input text.
    """
    scores = sia.polarity_scores(input_txt)
    print(scores)
    pos = float(scores["pos"])
    neg = float(scores["neg"])
    neu = float(scores["neu"])
    res = "positive"
    print("pos neg nue ", pos, neg, neu)
    if neg > pos and neg > neu:
        res = "negative"
    elif neu > neg and neu > pos:
        res = "neutral"
    res = json.dumps({"sentiment": res})
    print(res)
    return res


if __name__ == "__main__":
    app.run(debug=True)
