from flask import Flask
from views import views #import views variable from views.py in order to register blueprints

app = Flask(__name__) #Initializes the app
app.register_blueprint(views, url_prefix="/") #url_prefix is the preifx to access any of the views in this route


if __name__ == '__main__':
    app.run(debug=True, port=80) #launch application, port by default is 5000, debug = True autorefreshes app if any changes are made