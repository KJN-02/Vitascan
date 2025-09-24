import pandas as pd
import numpy as np
from sklearn.naive_bayes import GaussianNB
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import pickle
import json
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

# Load your dataset
def load_data():
    """
    Load the medical dataset from CSV file.
    """
    df = pd.read_csv("diseaseandsymptoms.csv")
    
    # Filter out diseases with insufficient samples
    value_counts = df['diseases'].value_counts()
    valid_classes = value_counts[value_counts > 1].index
    df_filtered = df[df['diseases'].isin(valid_classes)]
    
    return df_filtered

def train_model():
    """
    Train the ML model and save it along with encoders.
    """
    print("Loading dataset...")
    df = load_data()
    
    print(f"Dataset shape: {df.shape}")
    print(f"Number of diseases: {df['diseases'].nunique()}")
    print(f"Number of symptoms: {len(df.columns) - 1}")
    
    # Separate features and target
    X = df.drop('diseases', axis=1)
    y = df['diseases']
    
    # Get symptom columns
    symptom_columns = X.columns.tolist()
    
    # Encode target labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    # Train model (using Naive Bayes as in your example)
    print("Training Naive Bayes model...")
    model = GaussianNB()
    model.fit(X_train, y_train)
    
    # Calculate accuracy
    accuracy = model.score(X_test, y_test)
    print(f"Model accuracy: {accuracy:.4f}")
    
    # Get class distribution
    unique_diseases = label_encoder.classes_
    print(f"Trained on {len(unique_diseases)} diseases")
    
    # Save model and encoders
    model_data = {
        'model': model,
        'label_encoder': label_encoder,
        'symptom_columns': symptom_columns,
        'accuracy': accuracy,
        'diseases': unique_diseases.tolist()
    }
    
    with open('medical_model.pkl', 'wb') as f:
        pickle.dump(model_data, f)
    
    print("Model saved as 'medical_model.pkl'")
    print(f"Available symptoms: {len(symptom_columns)}")
    
    return model_data

if __name__ == "__main__":
    # Train and save the model
    train_model()
