import Int "mo:core/Int";
import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type CarStatus = {
    #driving;
    #parked;
    #idle;
  };

  module CarStatus {
    public func compare(status1 : CarStatus, status2 : CarStatus) : Order.Order {
      switch (status1, status2) {
        case (#driving, #driving) { #equal };
        case (#driving, #parked) { #less };
        case (#driving, #idle) { #less };
        case (#parked, #driving) { #greater };
        case (#parked, #parked) { #equal };
        case (#parked, #idle) { #less };
        case (#idle, #driving) { #greater };
        case (#idle, #parked) { #greater };
        case (#idle, #idle) { #equal };
      };
    };
  };

  type CarProfile = {
    owner : Principal;
    nickname : Text;
    model : Text;
    batteryLevel : Nat;
    status : CarStatus;
    lastUpdated : Time.Time;
  };

  module CarProfile {
    public func compare(car1 : CarProfile, car2 : CarProfile) : Order.Order {
      switch (Text.compare(car1.nickname, car2.nickname)) {
        case (#equal) { Int.compare(car1.lastUpdated, car2.lastUpdated) };
        case (order) { order };
      };
    };
  };

  type BatteryAlert = {
    car : CarProfile;
    timestamp : Time.Time;
  };

  module BatteryAlert {
    public func compareByTimestamp(alert1 : BatteryAlert, alert2 : BatteryAlert) : Order.Order {
      Int.compare(alert1.timestamp, alert2.timestamp);
    };
  };

  type Message = {
    from : Principal;
    to : ?Principal;
    content : Text;
    timestamp : Time.Time;
    read : Bool;
  };

  type RegisterCarInput = {
    nickname : Text;
    model : Text;
    batteryLevel : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  let cars = Map.empty<Principal, CarProfile>();
  let alerts = List.empty<BatteryAlert>();

  let messages = Map.empty<Principal, List.List<Message>>();
  let broadcastMessages = List.empty<Message>();

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func registerCar(input : RegisterCarInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register cars");
    };

    if (input.batteryLevel > 100) {
      Runtime.trap("Battery level must be between 0 and 100");
    };

    let carProfile : CarProfile = {
      owner = caller;
      nickname = input.nickname;
      model = input.model;
      batteryLevel = input.batteryLevel;
      status = #idle;
      lastUpdated = Time.now();
    };

    cars.add(caller, carProfile);
  };

  public shared ({ caller }) func updateBatteryLevel(batteryLevel : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update battery level");
    };

    if (batteryLevel > 100) {
      Runtime.trap("Battery level must be between 0 and 100");
    };

    let car = switch (cars.get(caller)) {
      case (null) {
        Runtime.trap("Car profile not found");
      };
      case (?car) { car };
    };

    let updatedCar : CarProfile = {
      car with
      batteryLevel;
      lastUpdated = Time.now();
    };

    cars.add(caller, updatedCar);

    if (batteryLevel <= 20) {
      let alert : BatteryAlert = {
        car = updatedCar;
        timestamp = Time.now();
      };
      alerts.add(alert);
      if (alerts.size() > 50) {
        ignore alerts.removeLast();
      };
    };
  };

  public shared ({ caller }) func updateStatus(status : CarStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update status");
    };

    let car = switch (cars.get(caller)) {
      case (null) {
        Runtime.trap("Car profile not found");
      };
      case (?car) { car };
    };

    let updatedCar : CarProfile = {
      car with
      status;
      lastUpdated = Time.now();
    };

    cars.add(caller, updatedCar);
  };

  public query ({ caller }) func getOwnCarProfile() : async CarProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view car profiles");
    };

    switch (cars.get(caller)) {
      case (null) {
        Runtime.trap("Car profile not found");
      };
      case (?car) { car };
    };
  };

  public query ({ caller }) func getAllActiveCars() : async [CarProfile] {
    let carArray = cars.values().toArray();
    carArray.sort();
  };

  public query func getAlertFeed() : async [BatteryAlert] {
    let sortedAlerts = alerts.toArray().sort(BatteryAlert.compareByTimestamp);
    sortedAlerts.reverse();
  };

  public shared ({ caller }) func sendMessage(to : ?Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let message : Message = {
      from = caller;
      to;
      content;
      timestamp = Time.now();
      read = false;
    };

    switch (to) {
      case (?recipient) {
        let recipientMessages = switch (messages.get(recipient)) {
          case (null) {
            let newList = List.empty<Message>();
            messages.add(recipient, newList);
            newList;
          };
          case (?existing) { existing };
        };
        recipientMessages.add(message);
      };
      case (null) {
        broadcastMessages.add(message);
      };
    };
  };

  public query ({ caller }) func getMessages() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    let personalMessages = switch (messages.get(caller)) {
      case (null) { List.empty<Message>() };
      case (?msgs) { msgs };
    };

    let personalArray = personalMessages.toArray();
    let broadcastArray = broadcastMessages.toArray();

    let combinedArray = personalArray.concat(broadcastArray);
    combinedArray;
  };

  public shared ({ caller }) func markMessagesAsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark messages as read");
    };

    let personalMessages = switch (messages.get(caller)) {
      case (null) { List.empty<Message>() };
      case (?msgs) { msgs };
    };

    let unreadMessages = personalMessages.filter(func(msg) { not msg.read });
    let readMessages = personalMessages.filter(func(msg) { msg.read });

    personalMessages.clear();

    unreadMessages.forEach(func(msg) { personalMessages.add({ msg with read = true }) });
    readMessages.forEach(func(msg) { personalMessages.add(msg) });
  };

  public shared ({ caller }) func deleteCarProfile() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete car profiles");
    };

    switch (cars.get(caller)) {
      case (null) { Runtime.trap("Car profile not found") };
      case (?_) {};
    };
    cars.remove(caller);
  };
};
