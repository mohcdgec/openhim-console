'use strict';
/* global sinon:false */
/* jshint expr: true */

describe('Controller: ClientsmodalCtrl', function () {
  // load the controller's module
  beforeEach(module('openhimWebui2App'));

  var scope, createController, httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend) {

    httpBackend = $httpBackend;

    $httpBackend.when('GET', new RegExp('config/default.json')).respond({ 'protocol': 'https', 'host': 'localhost', 'port': 8080, 'title': 'Title', 'footerTitle': 'FooterTitle', 'footerPoweredBy': 'FooterPoweredBy' });

    $httpBackend.when('GET', new RegExp('.*/clients')).respond([
      {clientID: 'test1', clientDomain: 'test1.openhim.org', name: 'Test 1', roles: ['test', 'testing2'], passwordAlgorithm: 'sha512', passwordHash: '1234', passwordSalt: '1234'},
      {clientID: 'test2', clientDomain: 'test2.openhim.org', name: 'Test 2', roles: ['test', 'testing again'], passwordAlgorithm: 'sha512', passwordHash: '1234', passwordSalt: '1234'}
    ]);

    $httpBackend.when('GET', new RegExp('.*/keystore/ca')).respond([
      { 'country': 'US', 'state': 'Missouri', 'locality': 'St. Louis', 'organization': 'Mallinckrodt Institute of Radiology', 'organizationUnit': 'Electronic Radiology Lab', 'commonName': 'MIR2014-16', 'emailAddress': 'moultonr@mir.wustl.edu', 'data': '-----FAKE CERTIFICATE DATA-----', '_id': '54e1ca5afa069b5a7b938c4f', 'validity': { 'start': '2014-10-09T13:15:28.000Z', 'end': '2016-11-29T13:15:28.000Z' }},
      { 'country': 'ZA', 'state': 'KZN', 'locality': 'Durban', 'organization': 'Jembi Health Systems NPC', 'organizationUnit': 'eHealth', 'commonName': 'openhim', 'emailAddress': 'ryan@jembi.org', 'data': '-----FAKE CERTIFICATE DATA-----', '_id': '54e1ca5afa069b5a7b938c50', 'validity': { 'start': '2014-11-25T12:52:21.000Z', 'end': '2016-10-30T12:52:21.000Z' }}
    ]);

    scope = $rootScope.$new();
    var modalInstance = sinon.spy();

    createController = function () {
      var client;
      client = {
        $save: sinon.spy(),
        $update: sinon.spy()
      };
      return $controller('ClientsModalCtrl', {
        $scope: scope,
        $modalInstance: modalInstance,
        client: client
      });
    };
  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should create a new client if this is not an update', function () {
    createController();
    httpBackend.flush();

    scope.client.should.be.ok;
  });

  it('should run validateFormClients() for any validation errors - ngErrors.hasErrors -> TRUE', function () {
    createController();
    httpBackend.flush();

    scope.client.clientID = '';
    scope.client.name = '';
    scope.client.clientDomain = '';
    scope.client.roles = [];
    scope.temp.password = 'password';

    // run the validate
    scope.validateFormClients();
    scope.ngError.should.have.property('hasErrors', true);
    scope.ngError.should.have.property('clientID', true);
    scope.ngError.should.have.property('name', true);
    scope.ngError.should.have.property('clientDomain', true);
    scope.ngError.should.have.property('roles', true);
    scope.ngError.should.have.property('passwordConfirm', true);
  });

  it('should run validateFormClients() for any validation errors - ngErrors.hasErrors -> FALSE', function () {
    createController();
    httpBackend.flush();

    scope.client.clientID = 'clientID';
    scope.client.name = 'clientName';
    scope.client.clientDomain = 'clientDomain';
    scope.client.roles = ['admin', 'Poc'];
    scope.temp.password = 'password';
    scope.temp.passwordConfirm = 'password';

    // run the validate
    scope.validateFormClients();
    scope.ngError.should.have.property('hasErrors', false);
  });

  it('should run submitFormClients() and check any validation errors - FALSE - should not save the record', function () {
    createController();
    httpBackend.flush();

    scope.client.clientID = '';
    scope.client.name = '';
    scope.client.clientDomain = '';
    scope.client.roles = [];
    scope.temp.password = 'password';

    // run the submit
    scope.submitFormClients();
    scope.ngError.should.have.property('hasErrors', true);
    scope.ngError.should.have.property('clientID', true);
    scope.ngError.should.have.property('name', true);
    scope.ngError.should.have.property('clientDomain', true);
    scope.ngError.should.have.property('roles', true);
    scope.ngError.should.have.property('passwordConfirm', true);
  });

  it('should run submitFormClients() and check any validation errors - TRUE - Should save the record', function () {
    createController();
    httpBackend.flush();

    // update is false so create new client
    scope.update = false;

    scope.client.clientID = 'clientID';
    scope.client.name = 'clientName';
    scope.client.clientDomain = 'clientDomain';
    scope.client.roles = ['admin', 'Poc'];
    scope.temp.password = 'password';
    scope.temp.passwordConfirm = 'password';

    // run the submit
    scope.submitFormClients();
    scope.ngError.should.have.property('hasErrors', false);
    scope.client.$save.should.be.called;
  });

  it('should run submitFormClients() and check any validation errors - TRUE - Should update the record', function () {
    createController();
    httpBackend.flush();

    // update is false so create new client
    scope.update = true;

    scope.client.clientID = 'clientID';
    scope.client.name = 'clientName';
    scope.client.clientDomain = 'clientDomain';
    scope.client.roles = ['admin', 'Poc'];
    scope.temp.password = 'password';
    scope.temp.passwordConfirm = 'password';

    // run the submit
    scope.submitFormClients();
    scope.ngError.should.have.property('hasErrors', false);
    scope.client.$update.should.be.called;

    scope.client.should.have.property('passwordSalt' );
    scope.client.should.have.property('passwordHash');
    scope.client.should.have.property('clientID', 'clientID');
    scope.client.should.have.property('name', 'clientName');
    scope.client.should.have.property('clientDomain', 'clientDomain');
    scope.client.roles.should.have.length(2);
  });

  it('should create two taglist objects', function () {
    createController();
    httpBackend.flush();

    scope.taglistClientRoleOptions.should.have.length(3);
    
    scope.taglistClientRoleOptions[0].should.equal('test');
    scope.taglistClientRoleOptions[1].should.equal('testing2');
    scope.taglistClientRoleOptions[2].should.equal('testing again');
    
  });


});
