# Architecture

The server actualises a monolith whereby any number of services can be imported and registered in `the-services-collection.ts` to be provisioned by the application.

## Services

A service, created using `declareJsonApi(...)`, is a collection of requests declared using the `post(...)` method of the returned object.

A service corresponds to a predefined path that is passed to the `declareJsonApi(...)` function: `http://<host>:<port>/services/<service path>`. The service path has no handler and thus serves no other function but to prefix requests that belong to it.

Any number of requests may be registered with a service using the `post(...)` method. The method will require a *request name* and a  *request implementation version* as arguments, along with the handler function (i.e. the implementation).

All requests to a service are called using the HTTP POST method and will have an endpoint that follows the URL: `http://<host>:<port>/services/<service path>/<request name>/<request version>`

Note: The server implementation is strict and will not accept a trailing forward slash "/". The path to a request must be an *exact* match.

## Organisation and Dependencies Paradigmn

```text
┌───────────────────────────┐         ◀─┐                  
│ ┌───────────────────────┐ │           │                  
│ │                       │ ├──┐        │                  
│ │        Service        │ │||│        │                  
│ │                       │ │||├──┐     │                  
│ └───────────────────────┘ │||│##│     │                  
│ ┌───────────────────────┐ │||│##│     │                  
│ │                       │ │||│##│     │                  
│ │                       │ │||│##│     │  Services (1..N) 
│ │       Model(s)        │ │||│##│     │                  
│ │                       │ │||│##│     │                  
│ │                       │ │||│##│     │                  
│ └───────────────────────┘ │||│##│     │                  
└──┬────────────────────────┘||│##│     │                  
   │|||||||||||||||||||||||||||│##│     │                  
   └──┬────────────────────────┘##│     │                  
      │###########################│     │                  
      └───────────────────────────┘   ◀─┘                  
                                                           
┌───────────────────────┐ ┌───────┐                        
│                       │ │       │                        
│         Libs          │ │       │                        
│                       │ │       │                        
└───────────────────────┘ │       │                        
┌─────────────────────────┘       │                        
│                                 │                        
│             Common              │                        
│                                 │                        
└─────────────────────────────────┘                        
```

The server implementation is modular in that declarations of (innate) data, types, and behaviours are enveloped in common overarching structures that may materialise as distinct source files *or* a collection of source files in a distinguishing folder.

The server modules are organised into tiers that correspond to the directory structure of the codebase:

* `common`: For commonly-used low-level modules that may be used anywhere in the codebase without fear of inappropriate coupling (no pun intended).

* `libs`: For modules that provide complex higher-level functionality to services.

* `services`: Contains any number of modular units that provide functionality to the client in runtime.
Each service is contained within a folder consisting of a `service.ts` file that "default exports" a `JsonApiDeclaration`.
  
  * `model` or `models`: Since the primary purpose of the `service.ts` file is to provision service functionality via high-level handlers, it would be a bad idea to mix such code with that of underlying domain-specific functionality. To prevent obfuscation and ambiguity, by convention, each service folder should contain a `model` folder (or `models` if more than one in respective subfolders) to contain independent, uncoupled source files pertaining to the domain.

## Error Handling Paradigmn

Ensure a good understanding of the overall structure of the codebase (detailed above) before attempting to understanding error handling.

In essence, as far as possible, modules throughout the codebase *with the exception of `services`* should throw a `RuntimeError` in the event of an unexpected occurance that warrants an alternate path of execution.

### Error Handling in Services

The definition of services via the (proper) utilisation of `declareJsonApi(...)` will force the handler to return either an `ApiSuccessResult` or `ApiErrorResult` object in response. The latter will be transformed, automatically, into the corresponding HTTP error response.

If, for whatever reason, the service implementation (i.e. handler function) allows for an exception to permeate through without, say, capturing it in a try-catch statement and effectively translating it into an `ApiErrorResponse` result, in this scenario the framework will automatically throw a generic Internal Server Error response (HTTP status code: 500).
