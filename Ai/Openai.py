import sys
import os
from openai import OpenAI
from dotenv import load_dotenv
import prompt

load_dotenv("config/.env")

# Set up your API key
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
 

# Function to generate a chatbot response
def chatbot(userInput):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
        {"role": "system", "content": prompt.generatePrompt2()},
        {
            "role": "user",
            "content": (userInput)
        }
    ]
    )
    return response.choices[0].message.content 


# Check if the script is being executed directly
if __name__ == "__main__":
    # Get userInput and currentPage from the command-line arguments
    if len(sys.argv) < 2:
        print("Error: Not enough arguments provided.")
        sys.exit(1)
    
    userInput = sys.argv[1]  # First command-line argument
    
    # Call the chatbot function and print the result
    try:
        result = chatbot(userInput)
        print(result)
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        sys.exit(1)


# Main loop for backend testing
"""

print("hej")
while True:
    user_input = input("You: ")
    if user_input.lower() == "exit": 
        break
    bot_response = chatbot(user_input)
    print(f"Bot: {bot_response}")   
"""