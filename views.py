from flask import Blueprint
from flask import render_template #import to access the templates folder and its files
from flask import request #for dealing with query parameters
from flask import jsonify #used to jsonify a python dictionary
from flask import redirect, url_for #imports for redirection

views = Blueprint(__name__, "views") #Initialize the blueprint


@views.route("/") #@ so it's a decorator
def home():
    return render_template("index.html", name="Jack", age="22")

@views.route("/profile") #<> allows the url to be dynamic
def profile():
    return render_template("profile.html")

@views.route("/pedalboard")
def pedalboard():
    return render_template("pedalboard.html")


#Returning JSON
@views.route("/json")
def get_json():
    return jsonify({'name': 'Jack', 'coolness': 10})


#Get data from a request that's incoming as well as redirecting
@views.route("/data")
def get_data():
    data = request.json
    return jsonify(data)

@views.route("/go-to-home")
def go_to_home():
    return redirect(url_for("views.home"))