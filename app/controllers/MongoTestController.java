package controllers;

import java.nio.file.Files;
import java.nio.file.Paths;

import org.jongo.Jongo;
import org.jongo.MongoCollection;

import com.mongodb.MongoClient;

import models.User;
import play.mvc.Controller;
import play.mvc.Result;

/**
 * Prueba de conexion a MongoDB
 */
public class MongoTestController extends Controller {

    public Result index() {
    	MongoClient mongoClient = new MongoClient("localhost",27017);
    	Jongo jongo = new Jongo(mongoClient.getDB("play-test"));
    	MongoCollection friends = jongo.getCollection("users");
    	User one = friends.findOne("{name: 'msegade'}").as(User.class);
    	try{
    		Files.write(Paths.get("/home/ec2-user/test.txt"), one.getName().getBytes());
    	}catch(Exception e){
		}
    	mongoClient.close();
        return TODO;
    }

}
