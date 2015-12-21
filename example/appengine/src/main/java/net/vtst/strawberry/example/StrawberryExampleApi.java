package net.vtst.strawberry.example;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.config.Named;
import com.google.api.server.spi.config.Nullable;

@Api(name = "example",
     title = "Strawberry Example",
     version = "v1",
     clientIds = {"128116520821-dullqdj9l0fd4ljhsjf849kraga0j8sd.apps.googleusercontent.com", com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
     namespace = @ApiNamespace(ownerDomain = "strawberry.vtst.net",
                               ownerName = "strawberry.vtst.net",
                               packagePath=""))
public class StrawberryExampleApi {
  
  public static class RequestBean {
    public String weekday;
    public String city;
  }

  public static class ResponseBean {
    public String data;
  }
  
  @ApiMethod(name = "sayHi")
  public ResponseBean sayHi(@Named("name") String name) {
    ResponseBean response = new ResponseBean();
    response.data = "Hi, " + name;
    return response;
  }
  
  @ApiMethod(name = "sayLongHi")
  public ResponseBean sayLongHi(
      @Named("firstName") String firstName,
      @Named("lastName") String lastName,
      @Named("middleName") @Nullable String middleName,
      RequestBean request) {
    ResponseBean response = new ResponseBean();
    response.data = "Hi, " + firstName + (middleName == null ? "" : " " + middleName) + " " + lastName + ".";
    if (request.weekday != null)
      response.data += "It's " + request.weekday + ".";
    return response;
  }

  @ApiMethod(name = "sayHiAuth")
  public ResponseBean sayHiAuth(@Named("name") String name, User user) {
    ResponseBean response = new ResponseBean();
    response.data = "Hi, " + name + ", you're ";
    if (user == null) {
      response.data += "not authenticated";
    } else {
      response.data += user.getEmail();
    }
    return response;
  }

}
