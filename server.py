from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

package_data = []

# Flask server that parses the received packages and sends them to frontend part
@app.route("/new_connection", methods=["POST"])
def new_connection():
    """
    Endpoint to receive package info from senders.
    Expects JSON data in the request body.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        # Extract and store package info
        package_data.append(data)
        return jsonify({"message": "Package info received successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_packages", methods=["GET"])
def get_packages():
    """
    Endpoint to retrieve all stored package info as JSON.
    """
    try:
        x = package_data.pop()
        return x, 200
    except:
        return 404



if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)