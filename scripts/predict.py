import sys
import json
import os
import pickle
import numpy as np

def predict_disease(symptoms_list):
    """
    Predict disease based on symptoms using your trained model.
    """
    try:
        # Get the directory of this script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, 'medical_model.pkl')
        
        # Check if model exists
        if not os.path.exists(model_path):
            return {
                'success': False,
                'error': 'ML model not found. Please train the model first by running: python3 load-data.py'
            }
        
        # Load model
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        model = model_data['model']
        label_encoder = model_data['label_encoder']
        symptom_columns = model_data['symptom_columns']
        
        # Create feature vector
        input_vector = np.zeros(len(symptom_columns))
        matched_symptoms = []
        unmatched_symptoms = []
        
        for symptom in symptoms_list:
            # Try exact match first
            if symptom in symptom_columns:
                index = symptom_columns.index(symptom)
                input_vector[index] = 1
                matched_symptoms.append(symptom)
            else:
                # Try case-insensitive and partial matching
                symptom_lower = symptom.lower().strip()
                found = False
                
                for i, col in enumerate(symptom_columns):
                    col_lower = col.lower().strip()
                    # Exact match
                    if col_lower == symptom_lower:
                        input_vector[i] = 1
                        matched_symptoms.append(col)
                        found = True
                        break
                    # Partial match (symptom contains column name or vice versa)
                    elif symptom_lower in col_lower or col_lower in symptom_lower:
                        input_vector[i] = 1
                        matched_symptoms.append(col)
                        found = True
                        break
                
                if not found:
                    unmatched_symptoms.append(symptom)
        
        # Make prediction only if we have matched symptoms
        if len(matched_symptoms) == 0:
            return {
                'success': False,
                'error': 'No matching symptoms found in the dataset',
                'unmatched_symptoms': unmatched_symptoms,
                'available_symptoms': symptom_columns[:30],  # Show first 30 for reference
                'total_available': len(symptom_columns)
            }
        
        # Make prediction
        prediction = model.predict([input_vector])[0]
        predicted_disease = label_encoder.inverse_transform([prediction])[0]
        
        # Get prediction probabilities
        prediction_proba = model.predict_proba([input_vector])[0]
        
        # Get top predictions (only those with reasonable confidence)
        top_indices = np.argsort(prediction_proba)[-5:][::-1]  # Top 5
        
        results = []
        for idx in top_indices:
            disease = label_encoder.inverse_transform([idx])[0]
            confidence = prediction_proba[idx] * 100
            if confidence > 0.5:  # Only include predictions with >0.5% confidence
                results.append({
                    'disease': disease,
                    'confidence': round(confidence, 2)
                })
        
        # Generate recommendations based on matched symptoms
        recommendations = generate_recommendations(matched_symptoms, predicted_disease)
        
        return {
            'success': True,
            'primary_prediction': predicted_disease,
            'confidence': round(max(prediction_proba) * 100, 2),
            'top_predictions': results,
            'symptoms_analyzed': matched_symptoms,
            'unmatched_symptoms': unmatched_symptoms,
            'total_symptoms': len(symptoms_list),
            'matched_count': len(matched_symptoms),
            'recommendations': recommendations,
            'model_info': {
                'accuracy': model_data.get('accuracy', 'Unknown'),
                'total_diseases': len(label_encoder.classes_),
                'total_symptoms': len(symptom_columns)
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Prediction failed: {str(e)}'
        }

def generate_recommendations(symptoms, primary_disease):
    """
    Generate health recommendations based on symptoms and predicted disease.
    """
    recommendations = [
        "⚕️ Consult with a healthcare professional for proper diagnosis and treatment",
        "📝 Monitor your symptoms and note any changes or worsening",
        "📊 Keep a symptom diary to track patterns and triggers"
    ]
    
    # Add specific recommendations based on symptoms
    symptom_lower = [s.lower() for s in symptoms]
    
    if any('fever' in s for s in symptom_lower):
        recommendations.extend([
            "🌡️ Monitor your temperature regularly and stay hydrated",
            "😴 Rest and avoid strenuous activities",
            "💊 Consider fever-reducing medication if recommended by a healthcare provider"
        ])
    
    if any('cough' in s for s in symptom_lower) or any('breathing' in s for s in symptom_lower):
        recommendations.extend([
            "🚭 Avoid smoking and exposure to air pollutants",
            "💨 Use a humidifier to ease breathing",
            "🛏️ Stay upright when sleeping if breathing is difficult"
        ])
    
    if any('headache' in s or 'head' in s for s in symptom_lower):
        recommendations.extend([
            "😴 Ensure adequate sleep and manage stress levels",
            "🌙 Stay in a quiet, dark environment",
            "💧 Stay hydrated and maintain regular meals"
        ])
    
    if any('stomach' in s or 'nausea' in s or 'vomit' in s for s in symptom_lower):
        recommendations.extend([
            "🍌 Eat bland, easy-to-digest foods (BRAT diet: bananas, rice, applesauce, toast)",
            "💧 Stay hydrated with small, frequent sips of water",
            "🚫 Avoid dairy, caffeine, and spicy foods temporarily"
        ])
    
    if any('pain' in s for s in symptom_lower):
        recommendations.extend([
            "🧊 Apply appropriate heat or cold therapy as suitable",
            "🤸 Gentle stretching or movement may help if tolerated",
            "⚠️ Avoid activities that worsen the pain"
        ])
    
    # Add disease-specific recommendations
    disease_lower = primary_disease.lower()
    
    if 'diabetes' in disease_lower:
        recommendations.append("📈 Monitor blood sugar levels regularly and follow diabetic diet guidelines")
    elif 'hypertension' in disease_lower or 'blood pressure' in disease_lower:
        recommendations.append("🩺 Monitor blood pressure and reduce sodium intake")
    elif 'asthma' in disease_lower:
        recommendations.append("💨 Avoid known triggers and keep rescue inhaler accessible")
    elif 'arthritis' in disease_lower:
        recommendations.append("🏃 Gentle exercise and joint protection techniques may help")
    
    # Always add disclaimer
    recommendations.append("⚠️ This is an AI-generated analysis and should not replace professional medical advice")
    
    return recommendations

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python predict.py <symptoms_json>'
        }))
        sys.exit(1)
    
    try:
        symptoms_json = sys.argv[1]
        symptoms = json.loads(symptoms_json)
        result = predict_disease(symptoms)
        print(json.dumps(result))
    except json.JSONDecodeError:
        print(json.dumps({
            'success': False,
            'error': 'Invalid JSON input'
        }))
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))
