// "use strict";

// app.factory("ItemStorage", ($http, FBCreds) => {

//   // getter
//   let getItemList = () => {
//     let items = [];
//     return new Promise((resolve, reject) => {
//       $http.get(`${FBCreds.URL}/items.json`)
//         .success((itemObject) => {
//           let itemCollection = itemObject;
//           Object.keys(itemCollection).forEach((key) => {
//             itemCollection[key].id = key;
//             items.push(itemCollection[key]);
//             console.log("itemCollection: ", itemCollection);
//             console.log("itemCollection: ", itemCollection[key]);
//           });
//           resolve(items);
//         })
//         .error((error) => {
//           reject(error);
//         });
//     });

//   };

//   let getSingleItem = (itemId) => {
//     return new Promise((resolve, reject) => {
//       $http.get(`${FBCreds.URL}/items/${itemId}.json`)
//         .success((itemObject) => {
//           resolve(itemObject);
//         })
//         .error((error) => {
//           reject(error);
//         });
//     });
//   };

//   // setter
//   let postNewItem = (newTask) => {
//     return new Promise((resolve, reject) => {
//       $http.post(`${FBCreds.URL}/items.json`,
//         angular.toJson(newTask))
//         .success((obj) => {
//           resolve(obj);
//         })
//         .error((error) => {
//           reject(error);
//         });
//     });
//   };



//   return { getItemList, postNewItem, getSingleItem };
// });
