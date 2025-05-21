# jarvis-voice-assistant

A modular voice assistant application with support for multiple state-of-the-art models.

## Features
- Modular design allowing for different Speech-to-Text (STT), Large Language Model (LLM), and Text-to-Speech (TTS) backends.
- Supports multiple STT services: OpenAI, Groq, Deepgram, FastWhisperAPI.
- Supports multiple LLM services: OpenAI, Groq, Ollama.
- Supports multiple TTS services: OpenAI, Deepgram, ElevenLabs, MeloTTS, Cartesia, Piper.
- Support for local models for STT, LLM, and TTS, allowing for offline usage.
- Configuration managed via environment variables for easy setup.
- Maintains a chat history for contextual conversations.
- Customizable system prompt for the voice assistant's personality and behavior.
- Voice input recording and audio output playback.

## Configuration
The voice assistant is configured using environment variables. Create a `.env` file in the root of the project by copying the `example.env` file:
```bash
cp example.env .env
```
Then, edit the `.env` file to set your API keys and model preferences.

### Model Selection
You can choose the models for transcription, response generation, and text-to-speech by setting the following variables in your `.env` file:

*   `TRANSCRIPTION_MODEL`: Specifies the STT model.
    *   Possible values: `openai`, `groq`, `deepgram`, `fastwhisperapi`, `local`
*   `RESPONSE_MODEL`: Specifies the LLM for generating responses.
    *   Possible values: `openai`, `groq`, `ollama`, `local`
*   `TTS_MODEL`: Specifies the TTS model.
    *   Possible values: `openai`, `deepgram`, `elevenlabs`, `melotts`, `cartesia`, `piper`, `local`

### API Keys
Depending on the models you choose, you will need to provide API keys:

*   `OPENAI_API_KEY`: Your API key for OpenAI services (used for STT, LLM, TTS).
*   `GROQ_API_KEY`: Your API key for Groq services (used for STT, LLM).
*   `DEEPGRAM_API_KEY`: Your API key for Deepgram services (used for STT, TTS).
*   `ELEVENLABS_API_KEY`: Your API key for ElevenLabs services (used for TTS).
*   `CARTESIA_API_KEY`: Your API key for Cartesia services (used for TTS).

### Local Models and Specific Model Choices
*   `LOCAL_MODEL_PATH`: If you are using `local` for any of the `TRANSCRIPTION_MODEL`, `RESPONSE_MODEL`, or `TTS_MODEL`, specify the path to your local model files or directories here. The exact requirement might vary based on the local model integration (e.g., path to a model file, a directory containing models, etc.).
*   `PIPER_SERVER_URL`: If using `piper` for TTS, specify the URL of your Piper server (e.g., `http://localhost:5000`).
*   `OLLAMA_LLM`: Specify the Ollama LLM to be used (e.g., `llama3:8b`) when `RESPONSE_MODEL` is set to `ollama`.
*   `GROQ_LLM`: Specify the Groq LLM to be used (e.g., `llama3-8b-8192`) when `RESPONSE_MODEL` is set to `groq`.
*   `OPENAI_LLM`: Specify the OpenAI LLM to be used (e.g., `gpt-4o`) when `RESPONSE_MODEL` is set to `openai`.
*   `TTS_PORT_LOCAL`: Port for the local MeloTTS server if `TTS_MODEL` is set to `melotts`. Defaults to `5150`.

Refer to `voice_assistant/config.py` for default values and more details on how these configurations are used.

## Usage

### Prerequisites
- Python 3.10 or higher.
- API keys for the services you intend to use (see Configuration section).
- For local models, ensure you have the necessary model files and dependencies installed. For example, MeloTTS has its own installation procedure.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/PromtEngineer/JARVIS-VoiceAssistant.git
    cd JARVIS-VoiceAssistant
    ```

2.  **Create and activate a virtual environment (recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3.  **Install dependencies:**
    The project lists its dependencies in `setup.py`. You can install them using pip:
    ```bash
    pip install .
    ```
    Alternatively, if a `requirements.txt` file is present and up-to-date, you can use:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up configuration:**
    Copy the `example.env` file to `.env` and fill in your API keys and model preferences as described in the Configuration section.
    ```bash
    cp example.env .env
    ```

### Running the Assistant

Once installed and configured, you can run the voice assistant using the main script:
```bash
python run_voice_assistant.py
```
If you installed the package using `pip install .`, you should also be able to run it using the console script (defined in `setup.py`):
```bash
jarvis
```
The assistant will start, listen for your voice input, process it, and respond. Say "goodbye" or "arrivederci" to exit the program.

## Contributing
Contributions are welcome! If you'd like to contribute to this project, please follow these general guidelines:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/your-feature-name
    ```
    or
    ```bash
    git checkout -b fix/your-bug-fix
    ```
3.  **Make your changes.** Ensure your code follows the project's style and that you add or update tests as appropriate.
4.  **Commit your changes** with a clear and descriptive commit message.
5.  **Push your branch** to your forked repository.
6.  **Open a pull request** to the main repository, detailing the changes you've made.

Please ensure your code is well-commented and, if you're adding new features, consider updating the README or other documentation as needed.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
