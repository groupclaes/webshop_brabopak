# Brabopak Webshop [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=groupclaes_webshop_brabopak&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=groupclaes_webshop_brabopak) [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=groupclaes_webshop_brabopak&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=groupclaes_webshop_brabopak) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=groupclaes_webshop_brabopak&metric=bugs)](https://sonarcloud.io/summary/new_code?id=groupclaes_webshop_brabopak) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=groupclaes_webshop_brabopak&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=groupclaes_webshop_brabopak)

## Brabopak Webshop API

### Index
- Available controllers & routes w/ & w/o authorization
- How to

### Available Controllers & Routes
- [Ecommerce](###Ecommerce) https://shop.groupclaes.be/api/v1/ecommerce
  - [Carts](####Carts) https://shop.groupclaes.be/api/v1/ecommerce/carts
  - [Dashboard](####Dashboard) https://shop.groupclaes.be/api/v1/ecommerce/dashboard
  - [Menu](####Menu) https://shop.groupclaes.be/api/v1/ecommerce/menu
  - [Orders](####Orders) https://shop.groupclaes.be/api/v1/ecommerce/orders
- [Manage](###Manage) https://shop.groupclaes.be/api/v1/manage
  - [Users](####Users) https://shop.groupclaes.be/api/v1/manage/users
- [Products](###Products) https://shop.groupclaes.be/api/v1/products
- [Search](###Search) https://shop.groupclaes.be/api/v1/search
- [SSO](###SSO) https://shop.groupclaes.be/api/v1/sso
  - [Authorize](####Authorize) https://shop.groupclaes.be/api/v1/sso/authorize
  - [Token](####Token) https://shop.groupclaes.be/api/v1/sso/token
  - [Users](####Users) https://shop.groupclaes.be/api/v1/sso/users


### How to
#### View logs in elastic, go to elastic.groupclaes.be => Webshop Fastify Logs
Search for `company: "bra" and version: "v1"` or `company: "bra" and version: "uat"` to view uat environment logs  
You can also narrow the search down to a single service eg; `and service: "manage"` or `and service: "search"`