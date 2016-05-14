package models;

import org.jongo.marshall.jackson.oid.MongoId;
import org.jongo.marshall.jackson.oid.MongoObjectId;

public class User {
	@MongoId @MongoObjectId
	public String _id;
	
	public String username;
	public String password;
	
	@Override
	public String toString() {
		return "_id {"			+_id		+"} "+
				"username: {"	+username	+"} "+
				"password: {********}";
	}
}
