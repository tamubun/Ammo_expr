'use strict';
import * as THREE from './js/three/build/three.module.js';

var camera, scene, renderer;
var physicsWorld;
var clock = new THREE.Clock();

var pos = new THREE.Vector3();
var vec = new THREE.Vector3();
var quat = new THREE.Quaternion();
var transformAux1;
var margin = 0.05;
var rigidBodies = [];

function init() {
  initGraphics();
  initPhysics();
  createObjects();
}

function initGraphics() {
  var container = document.getElementById('container');
  camera = new THREE.PerspectiveCamera(
	60, window.innerWidth / window.innerHeight, 0.2, 2000);
  camera.position.set(0, -1, 16);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfd1e5);
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x707070));

  var light = new THREE.DirectionalLight(0x888888, 1);
  light.position.set(-10, 18, 5);
  scene.add(light);

  window.addEventListener('resize', onWindowResize, false);
}

function initPhysics() {
  var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  var broadphase = new Ammo.btDbvtBroadphase();
  var solver = new Ammo.btSequentialImpulseConstraintSolver();
  physicsWorld = new Ammo.btDiscreteDynamicsWorld(
	dispatcher, broadphase, solver, collisionConfiguration);
  physicsWorld.setGravity(new Ammo.btVector3(0, 0, 0));
  transformAux1 = new Ammo.btTransform();
}

function createObjects() {
  var radius = 0.8;
  var height = 6;
  var mass = 2;
  var object = new THREE.Mesh(
	new THREE.CylinderBufferGeometry(radius, radius, height, 20, 1),
	new THREE.MeshPhongMaterial({color: 0x00ff00})
  );
  var top = new THREE.Mesh(
	new THREE.CylinderBufferGeometry(radius, radius, 0.01, 20, 1),
	new THREE.MeshPhongMaterial({color: 0x004080})
  );
  top.position.set(0, height * 0.5, 0);
  object.add(top);
  var geom = new THREE.Geometry();
  geom.vertices.push(
	new THREE.Vector3(0, height * 0.5+0.02, 0),
	new THREE.Vector3(radius+0, height * 0.5 + 0.02, 0),
	new THREE.Vector3(radius+0, -height * 0.5 - 0.02, 0),
	new THREE.Vector3(0, -height * 0.5 - 0.02, 0)
  );
  var line =
	  new THREE.Line(geom, new THREE.LineBasicMaterial({color: 0xff0000}));
  object.add(line);
  var shape = new Ammo.btCylinderShape(
	new Ammo.btVector3(radius, height * 0.5, radius));
  shape.setMargin(margin);
  pos.set(0, 0, -7);
  vec.set(0, 0, 1);
  quat.setFromAxisAngle(vec, Math.PI/8);
  vec.set(2.5, 0, 0);
  var cylinder = createRigidBody(object, shape, mass, pos, quat, null, vec);

  var r1 = 1.7, r2 = 1.56, r3 = 0.78;
  object = new THREE.Mesh(
	(new THREE.SphereBufferGeometry(1, 20, 20)).scale(r1, r2, r3),
	new THREE.MeshPhongMaterial({color: 0xffffff})
  );
  top = new THREE.Mesh(
	new THREE.SphereGeometry(0.2, 20,20),
	new THREE.MeshPhongMaterial({color: 0xff0000})
  );
  top.position.set(0, r2, 0);
  object.add(top);
  var shape = new Ammo.btSphereShape(1);
  shape.setLocalScaling(new Ammo.btVector3(r1, r2, r3));
  pos.set(0, 6, -7);
  vec.set(0, 0, 1);
  quat.setFromAxisAngle(vec, -Math.PI/2/90*89);
  vec.set(4, 0, 0);
  var ellipsoid = createRigidBody(object, shape, mass, pos, quat, null, vec);
  /* createRigidBody()内で使っている calculateLocalInertia()は
	 scalingを反映してないので、自前で慣性モーメントを更新する必要がある。
	 あと、setLocalScaling()で球を楕円体にしても、衝突判定は
	 球のままみたい。physicsWorld.updateSingleAabb(ellipsoid)でも
	 上手く行かん。よく分らん。
  */
  ellipsoid.setMassProps(
	mass,
	new Ammo.btVector3(
	  mass * (r2*r2 + r3*r3) / 5,
	  mass * (r3*r3 + r1*r1) / 5,
	  mass * (r1*r1 + r2*r2) / 5));
  ellipsoid.updateInertiaTensor(); // 念の為

  object = new THREE.Mesh(
	  new THREE.BoxBufferGeometry(30, 0.2, 30),
	  new THREE.MeshPhongMaterial({color: 0xffffff})
  );
  shape = new Ammo.btBoxShape(new Ammo.btVector3(15, 0.1, 15));
  pos.set(0, -5, -7);
  vec.set(0, 0, 1);
  quat.setFromAxisAngle(vec, 0);
  var ground = createRigidBody(object, shape, 0, pos, quat, null, null);

  r1 = 1.5; r2 = 1;
  object = new THREE.Mesh(
	new THREE.SphereGeometry(r1, 20,20),
	new THREE.MeshPhongMaterial({color: 0x00ff00})
  );
  var object2 = new THREE.Mesh(
	new THREE.SphereGeometry(r2, 20,20),
	new THREE.MeshPhongMaterial({color: 0x00ff00})
  );
  object2.position.set(0, r1, 0);
  object.add(object2);
  shape = new Ammo.btConvexHullShape();
  shape.addPoint(new Ammo.btVector3(0, -r1, 0));
  shape.addPoint(new Ammo.btVector3(r1, 0, 0));
  shape.addPoint(new Ammo.btVector3(-r1, 0, 0));
  shape.addPoint(new Ammo.btVector3(0, 0, r1));
  shape.addPoint(new Ammo.btVector3(0, 0, -r1));
  shape.addPoint(new Ammo.btVector3(r2, r1, 0));
  shape.addPoint(new Ammo.btVector3(-r2, r1,  0));
  shape.addPoint(new Ammo.btVector3(0, r1, r2));
  shape.addPoint(new Ammo.btVector3(0, r1, -r2));
  shape.addPoint(new Ammo.btVector3(0, r1 + r2, 0));
  pos.set(-5, 0, -7);
  vec.set(0, 0, 1);
  quat.setFromAxisAngle(vec, Math.PI/1.1);
  vec.set(0, -2, 0);
  createRigidBody(object, shape, mass, pos, quat, vec, vec);
}

function createRigidBody(object, physicsShape, mass, pos, quat, vel, angVel) {
  if ( pos ) {
	object.position.copy(pos);
  } else {
	pos = object.position;
  }

  if ( quat ) {
	object.quaternion.copy(quat);
  } else {
	quat = object.quaternion;
  }

  var transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  var motionState = new Ammo.btDefaultMotionState(transform);

  var localInertia = new Ammo.btVector3(0, 0, 0);
  physicsShape.calculateLocalInertia(mass, localInertia);

  var rbInfo = new Ammo.btRigidBodyConstructionInfo(
	mass, motionState, physicsShape, localInertia);
  var body = new Ammo.btRigidBody(rbInfo);

  body.setFriction(0.5);

  if ( vel ) {
	body.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z));
  }

  if ( angVel ) {
	body.setAngularVelocity(new Ammo.btVector3(angVel.x, angVel.y, angVel.z));
  }

  object.userData.physicsBody = body;
  object.userData.collided = false;

  scene.add(object);

  if (mass > 0) {
	rigidBodies.push(object);

	// Disable deactivation
	body.setActivationState(4);
  }

  physicsWorld.addRigidBody(body);

  return body;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  var deltaTime = clock.getDelta();

  updatePhysics(deltaTime);
  renderer.render(scene, camera);
}

function updatePhysics(deltaTime) {
  physicsWorld.stepSimulation(deltaTime, 10);

  // Update rigid bodies
  for ( var i = 0, il = rigidBodies.length; i < il; i ++ ) {
	var objThree = rigidBodies[i];
	var objPhys = objThree.userData.physicsBody;
	var ms = objPhys.getMotionState();

	if ( ms ) {
	  ms.getWorldTransform(transformAux1);
	  var p = transformAux1.getOrigin();
	  var q = transformAux1.getRotation();
	  objThree.position.set(p.x(), p.y(), p.z());
	  objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

	  objThree.userData.collided = false;
	}
  }
}

$(function() {
  Ammo().then(function(AmmoLib) {
	Ammo = AmmoLib;
	init();
	animate();
  });
});
