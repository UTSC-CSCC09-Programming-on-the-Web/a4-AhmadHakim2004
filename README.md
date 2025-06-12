[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Hc1JZ2U-)

# Web Gallery: Backend

The objective of these assignments is to build an application called _The Web Gallery_ where users can share pictures and comments. This application is similar to existing web applications such as Facebook, Instagram or Google Photos.

In this second assignment, you will concentrate on the backend. More specifically, you are going to build a Web API following the REST design principles.

## Instructions

> [!CAUTION]
> Github Copilot may be used in this assignment. However, if you decide to use prompt engineering to generate code using Github Copilot Chat, you must CLEARLY indicate the prompt you used and the generated code in the comments directly preceeding the code. No other AI tool is allowed.

For this assignment, you should use the packages that were introduced in the labs. No other packages are allowed unless explicitly mentioned otherwise.

Make sure that all of these required packages are recorded in the `package.json` file. When the TA is marking your assignment, they will clone your repository into a new directory and run `npm install` to install all the packages. If your code does not work in this way, you will receive a **0**.

> [!IMPORTANT]
> A `.github/workflows/express.yml` file is provided to help you sanity check that the server can be run on a fresh install. At least ensure that the CI passes before submitting your assignment.

### Code quality and organization

All of your work should be well organized. This directory should be organized as follows:

- `app.js`: the app entrypoint
- `static/`: your frontend developed for assignment 1 (HTML, CSS, Javascript and UI media files)
- `routers/`: the routers for the different resources
- `models/`: the models for the different resources
- `package.json` and `package-lock.json`: the Node.js packages and dependencies
- `uploads/`: the uploaded files
- `.gitignore`: list of files that should not be committed to github

Your code must be of good quality and follow all guidelines given during lectures, labs, and the previous assignment. Remember, any code found online and improperly credited can constitute an academic violation.

### Submission

You should submit your work to your Github course repository and Gradescope.

Before submitting your final version. You are strongly recommended checking that your code is portable. To do so:

- push your work to Github
- clone it into a new directory
- install all packages with the single command `npm install` that will install all packages found in the `package.json` file
- start the app with the command `node app.js`

> [!WARNING]
> As mentioned in the first lecture, if your code does not work like the above, you will automatically receive a **0**.

## Implementing the Web API

In this part, you are going to implement a Web API for your gallery. This api should follow the REST principles seen in class. This means that the api should define CRUD operations (Create, Read, Update, Delete) on collections and elements. For your application, users should be able to:

- add a new image to the gallery by uploading a file
- retrieve and delete a given image
- add a comment to a given image
- retrieve comments for a given image (a subset of comment at a time but not all comments at once)
- delete a given comment

> [!TIP]
> Be cognizant of which type of pagination you should use to make your life easier. Recall
> there are two types of pagination: offset-based and cursor-based. You should use the one that
> makes more sense for the collection.

> [!IMPORTANT]
> When designing an endpoint for an element, you should only return information about the
> element itself, and not about other elements.

## Integrating the frontend

This part of the assignment builds on top of what you have already built for assignment 1.

In this part, you are going to update your frontend to work with the Web API. As done in assignment 1, this frontend must be a [Single-Page Application (SPA)](https://en.wikipedia.org/wiki/Single-page_application) that loads a single HTML webpage. This webpage is updated dynamically as the user interacts with it. The page does not reload nor transfer
control to another page (except for the credits page that you keep separated). All features written for assignment 1 should be updated or completed to push and pull data from the API.

You must only use the newer Fetch API (and not `XMLHTTPRequest`). Also, you must use it with the Promise based approach. When the user is making an API call, you should have a loading animation to indicate that the request is being processed. This animation should be displayed until the request is completed. The TA will be using Chrome devtools to simulate slow network
behavior when testing the application.

> [!WARNING]
> You should not be using `async` and `await` in this assignment in the frontend. We will
> discuss this problem on Slack. Using async await will result in a penalty.

## OpenAPI Specifications for the Web API

You may use any OpenAPI specification generator of your choice to generate the OpenAPI specifications for your Web API. Include the generated OpenAPI specifications in `static/openapi.yml`. You may also use Github Copilot to assist you in generating the specifications. However, you must clearly indicate the prompt you used and the generated code in the comments directly preceeding the code. You must also manually verify and edit the generated OpenAPI specifications to ensure they are correct. The OpenAPI specifications should be in YAML format and should follow the OpenAPI 3.0 specification.

## Grading

The assignment will be graded out of 100 points. The breakdown is as follows:

- Functionality [50pts]
  - CRUD of images [20pts]
  - CRUD of comments [20pts]
  - Error, empty, loading states [10pts]
- Web API design [40pts]
  - REST [20pts]
  - Pagination [10pts]
  - Error handling [10pts]
- Code quality and organization [10pts]

Total: 100pts
