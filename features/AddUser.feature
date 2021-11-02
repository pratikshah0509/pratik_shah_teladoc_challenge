@pratik_shah_teladoc_challenge1 @addUser
Feature: Feature:
  As an Engr. Candidate
  I need to automate http://www.way2automation.com/angularjs-protractor/webtables/
  So I can show my awesome automation skills

  Scenario: Add a user and validate the user has been added to the table
    Given I open the webtables page
    When I click on Add User
    Then I should be able to validate that the user was added successfully


  Scenario: Delete user User Name: novak and validate user has been delete
    Given I open the webtables page
    When I search for user novak and delete it
    Then I should be able to validate that the user was deleted successfully