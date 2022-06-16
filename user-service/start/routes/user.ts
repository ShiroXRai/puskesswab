import Route from "@ioc:Adonis/Core/Route";

Route.resource("/users", "UsersController").apiOnly();

Route.post("user/register", "UsersController.register");
Route.post("users/login", "UsersController.login");
Route.get("logout", "UsersController.logout");
