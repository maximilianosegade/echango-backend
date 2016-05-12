package models;

import org.jongo.marshall.jackson.oid.MongoObjectId;

public class User {
	@MongoObjectId
	public String username;
	
	public String password;
}
