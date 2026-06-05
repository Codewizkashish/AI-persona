# High Traffic Ticket Booking System

## Repository

https://github.com/Shivansh08agr/Hack-The-Winter-R3

## Project Summary

A distributed ticket booking platform designed to handle massive traffic spikes during flash-sale events while preventing double booking and maintaining low latency.

## Problem It Solves

Traditional booking systems struggle under heavy concurrency, leading to race conditions, overselling, and degraded performance.

## Tech Stack

### Frontend

* React

### Backend

* Next.js
* Node.js

### Database

* DynamoDB
* Redis

### Infrastructure

* AWS SQS
* Socket.io

## My Contributions

* Integrated WebSockets for real-time updates.
* Implemented Redis-based caching mechanisms.
* Contributed to concurrency handling workflows.

## Biggest Technical Challenge

Preventing race conditions when thousands of users attempt to book the same seat simultaneously.

## Solution

Implemented Redis distributed locking using atomic operations to temporarily reserve seats during checkout.

## Future Improvements

* Build a custom in-memory distributed cache.
* Add multi-region deployment.
* Introduce predictive traffic scaling.

## Interview Questions and Answers

### Why was this project built?

To handle flash-sale traffic without crashes or double-booking issues.

### What was your contribution?

I worked on WebSockets integration and Redis-powered caching mechanisms.

### What was the biggest challenge?

Managing concurrent seat booking requests safely.

### What would you improve with two more weeks?

I would experiment with a custom-built distributed cache layer.

## Recruiter Summary

This project demonstrates backend engineering, distributed systems understanding, concurrency management, and scalable architecture design.
