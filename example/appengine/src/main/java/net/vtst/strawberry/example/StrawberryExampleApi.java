package net.vtst.strawberry.example;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.config.Named;

@Api(name = "example",
     title = "Strawberry Example",
     version = "v1",
     clientIds = {"128116520821-dullqdj9l0fd4ljhsjf849kraga0j8sd.apps.googleusercontent.com", com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
     namespace = @ApiNamespace(ownerDomain = "strawberry.vtst.net",
                               ownerName = "strawberry.vtst.net",
                               packagePath=""))
public class StrawberryExampleApi {
  
  public static class MyBean {
    public String data;
  }
  
  @ApiMethod(name = "sayHi")
  public MyBean sayHi(@Named("name") String name) {
    MyBean response = new MyBean();
    response.data = "Hi, " + name;
    return response;
  }

  @ApiMethod(name = "sayHiAuth")
  public MyBean sayHiAuth(@Named("name") String name, User user) {
    MyBean response = new MyBean();
    response.data = "Hi, " + name + ", you're ";
    if (user == null) {
      response.data += "not authenticated";
    } else {
      response.data += user.getEmail();
    }
    return response;
  }

}
