import Text "mo:core/Text";
import Float "mo:core/Float";
import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";



actor {
  type User = {
    email : Text;
    password : Text;
  };

  type Route = {
    id : Nat;
    from : Text;
    to : Text;
  };

  type Bus = {
    id : Nat;
    routeId : Nat;
    busNumber : Text;
    departureTime : Text;
    totalSeats : Nat;
    availableSeats : Nat;
  };

  type Location = {
    lat : Float;
    lng : Float;
    updatedAt : Int;
  };

  stable let users = Map.empty<Text, User>();
  stable let buses = Map.empty<Nat, Bus>();
  stable let busLocations = Map.empty<Nat, Location>();
  stable let userConfirmedBuses = Map.empty<Text, Nat>();

  func validateKiitEmail(email : Text) : Bool {
    email.endsWith(#text "@kiit.ac.in");
  };

  public shared ({ caller }) func register(email : Text, password : Text) : async () {
    if (not validateKiitEmail(email)) {
      Runtime.trap("Email must be a valid @kiit.ac.in address");
    };

    switch (users.get(email)) {
      case (?_) {
        Runtime.trap("This email is already registered");
      };
      case (null) {
        let user : User = { email; password };
        users.add(email, user);
      };
    };
  };

  // loginOrRegister: tries login, registers automatically if account not found
  public shared ({ caller }) func loginOrRegister(email : Text, password : Text) : async () {
    if (not validateKiitEmail(email)) {
      Runtime.trap("Email must be a valid @kiit.ac.in address");
    };
    switch (users.get(email)) {
      case (null) {
        // Auto-register new user
        let user : User = { email; password };
        users.add(email, user);
      };
      case (?user) {
        if (user.password != password) {
          Runtime.trap("Incorrect password. Please try again.");
        };
      };
    };
  };

  public shared ({ caller }) func login(email : Text, password : Text) : async () {
    switch (users.get(email)) {
      case (null) {
        Runtime.trap("No account associated with this email");
      };
      case (?user) {
        if (user.password != password) {
          Runtime.trap("Incorrect credentials. Please try again");
        };
      };
    };
  };

  public query ({ caller }) func getRoutes() : async [Route] {
    [
      { id = 1; from = "Campus 1"; to = "Campus 2" },
      { id = 2; from = "Campus 1"; to = "Campus 3" },
      { id = 3; from = "Campus 2"; to = "Campus 3" },
      { id = 4; from = "Campus 2"; to = "Campus 1" },
      { id = 5; from = "Campus 3"; to = "Campus 1" },
      { id = 6; from = "Campus 3"; to = "Campus 2" },
    ];
  };

  public query ({ caller }) func getBusesOnRoute(routeId : Nat) : async [Bus] {
    let busesOnRoute = List.empty<Bus>();
    for ((_, bus) in buses.entries()) {
      if (bus.routeId == routeId) {
        busesOnRoute.add(bus);
      };
    };
    busesOnRoute.toArray();
  };

  public shared ({ caller }) func confirmBus(busId : Nat, userEmail : Text) : async () {
    switch (users.get(userEmail)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?_) { userConfirmedBuses.add(userEmail, busId) };
    };
  };

  public query ({ caller }) func getUserConfirmedBus(userEmail : Text) : async ?Nat {
    userConfirmedBuses.get(userEmail);
  };

  public query ({ caller }) func getBusLocation(busId : Nat) : async ?Location {
    busLocations.get(busId);
  };

  public shared ({ caller }) func updateBusLocation(busId : Nat, lat : Float, lng : Float) : async () {
    let location : Location = { lat; lng; updatedAt = 0 };
    busLocations.add(busId, location);
  };
};
