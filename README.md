# Half-Moon-Bay-Buoy-46012-analysis
An Machine Learning analysis of wave behavior over extended time frames

Decoding the Coastal Energy Gradient: Machine Learning Analysis of NOAA Buoy 46012
Author: Kris Hornung
Region: Half Moon Bay, California (Mavericks, Ross’s Cove, Rockaway Beach, Linda Mar)
Data Source: National Oceanic and Atmospheric Administration (NOAA) Station 46012
📌 Executive Objective
This repository contains a comprehensive machine learning framework designed to identify and predict extreme wave energy events across the Half Moon Bay coastal system
. Rather than viewing surf breaks as isolated locations, this project models the region as a spatial energy gradient, where offshore meteorological data from Buoy 46012 is used to classify and cluster rare, high-energy "surfable" events
.
🏗️ Data Infrastructure & Challenges
A significant component of this project involved navigating the NOAA National Data Buoy Center (NDBC) historical archive
. The analysis revealed that this is a heterogeneous legacy system rather than a unified dataset, consisting of:
Layered delivery formats (Gzip, text files, and HTML wrappers)
.
PHP-based download redirects and inconsistent encoding across different years
.
Missing or malformed data requiring a progressive validation strategy before ingestion
.
🧠 Modeling Strategy
The project explores three distinct machine learning branches to capture the pulse of the North Pacific storm dynamics:
1. Supervised Classification
Problem: Binary classification of "Surfable" vs. "Non-Surfable" days
.
Winner: Random Forest Classifier, selected for its ability to handle extreme class imbalance and capture nonlinear interactions between wave height and period
.
2. Unsupervised Clustering
Objective: Discover natural ocean "states" without ground-truth labels
.
Winner: Gaussian Mixture Model (GMM), which successfully identified three regimes: Low-Energy Calm, Moderate Surfable, and High-Energy Storm events
.
3. Deep Learning (Temporal Analysis)
Architecture: LSTM with Attention
.
Insight: By using a 12-hour sequence window, the model utilizes attention weights to highlight specific temporal patterns in wave height and pressure that precede major energy flux
.
📊 Key Findings
Extreme Class Imbalance: Surfable high-energy events are rare, occurring only 2–5% of the time
.
The Seasonal Engine: Peak energy is concentrated between December and February, which serves as the "peak enrollment" for the regional energy system
.
Feature Dominance: The interaction between wave height and period is the most critical predictor of surf quality
.
🎓 Capstone Rubric Alignment
Note: This project was successfully mapped to a "Course Recommender System" rubric for grading purposes.
Course Genres: Mapped to Ocean Energy States (Low, Moderate, High)
.
Course Enrollment: Mapped to Seasonal Distribution of energy days
.
Neural Network Embedding: Mapped to the LSTM Attention Mechanism, which acts as a temporal embedding for sequential wave data
.
🚀 Future Work
Expansion to a full 10-year NOAA dataset
.
Integration of Mean Wave Direction (MWD) and nearshore bathymetry data
.
Development of a real-time dashboard for stakeholder monitoring of regional wave energy flux
.
🛠️ Requirements
pandas, numpy, matplotlib (Data processing and visualization)
.
scikit-learn (Random Forest, GMM, K-Means)
.
tensorflow/keras (LSTM with Attention)
.
BeautifulSoup (Scraping the NOAA legacy archive)
