# Designing and Prototyping exercises

Use `system_design/` for the greenfield design exercise.

The URL shortener service for the prototyping exercise is in `url_shortener/`.
Its README explains how to start the service and run its tests.

The analytics dashboard is in `analytics_dashboard/`. It has its own Compose
file and runs on port 1002.

The root `docker-compose.yml` provides the same learner sync services used by
other Skiller Whale exercise repositories. The service has its own Compose file
inside `url_shortener/`.
