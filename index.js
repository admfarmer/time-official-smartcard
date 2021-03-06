const fse = require('fs-extra');
const { Reader } = require('@tanjaae/thaismartcardreader')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const myReader = new Reader()
let urlAPI;

fse.readJson('./config.json')
  .then(json => {
    urlAPI = json.urlAPI;
    console.log(urlAPI);



    process.on('unhandledRejection', (reason) => {
      console.log('From Global Rejection -> Reason: ' + reason);
    });

    console.log('Waiting For Device !')
    myReader.on('device-activated', async (event) => {
      console.log('Device-Activated')
      console.log(event.name)
      console.log('=============================================')
    })

    myReader.on('error', async (err) => {
      console.log(err)
    })

    myReader.on('image-reading', (percent) => {
      console.log(percent)
    })

    myReader.on('card-removed', (err) => {
      var data = ' ';
      var xhr = new XMLHttpRequest();
      xhr.withCredentials = true;
      xhr.open("DELETE", `${urlAPI}/workTime/profile`);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send(data);
      console.log('== card remove ==')
    })

    myReader.on('card-inserted', async (person) => {
      console.log(person);
      var info = await person;

      const cid = await info.getCid();
      const thName = await info.getNameTH();
      const dob = await info.getDoB();

      console.log(`CitizenID: ${cid}`);
      console.log(`THName: ${thName.prefix} ${thName.firstname} ${thName.lastname}`);
      console.log(`DOB: ${dob.day}/${dob.month}/${dob.year}`);

      console.log('=============================================');

      var xhr = new XMLHttpRequest();
      var data = `&cid=${cid}`;
      data += `&title=${thName.prefix}`;
      data += `&fname=${thName.firstname}`;
      data += `&lname=${thName.lastname}`;
      data += `&birthDate=${dob.day}/${dob.month}/${dob.year}`;
      xhr.withCredentials = true;

      xhr.open("POST", `${urlAPI}/workTime/profile`);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.setRequestHeader("cache-control", "no-cache");
      xhr.setRequestHeader("Postman-Token", "6e874932-931e-4dd6-9ae2-c6788825d247");
      xhr.send(data);
    })

    myReader.on('device-deactivated', () => { console.log('device-deactivated') })


  }).catch(err => {
    console.log(err);
  })