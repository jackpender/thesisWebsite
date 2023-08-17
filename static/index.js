console.log("I am running");



// var slider = document.getElementById("myRange");
// var output = document.getElementById("demo");
// output.innerHTML = slider.value; // Display the default slider value

// // Update the current slider value (each time you drag the slider handle)
// slider.oninput = function() {
//   output.innerHTML = this.value;
//   // console.log(this.value);
// }

// const rotateImage = document.getElementById("rotateImage");
const volumeRange = document.getElementById("volumeRange");
const gainRangege = document.getElementById("gainRange");
const toneRange = document.getElementById("toneRange");


function volumeRotate(){
  // console.log(this.myRange.value)
  const angle = this.volumeRange.value;
  // const angle = 30
  const volume = document.getElementById("volume");

  volume.style.transform = 'rotate(' + angle*3.5 + 'deg)';
}
function gainRotate(){
  // console.log(this.myRange.value)
  const angle = this.gainRange.value;
  // const angle = 30
  const gain = document.getElementById("gain");

  gain.style.transform = 'rotate(' + angle*3.5 + 'deg)';
}
function toneRotate(){
  // console.log(this.myRange.value)
  const angle = this.toneRange.value;
  // const angle = 30
  const tone = document.getElementById("tone");

  tone.style.transform = 'rotate(' + angle*3.5 + 'deg)';
}


// PRESET FUNCTIONALITY

var preset = {
  name: "",
  volume: 0,
  gain: 0,
  tone: 0
}

var presets = []

// document.querySelector("#savePreset").addEventListener("click", function() {
//   presets.push({name: "Preset"+(presets.length+1), volume: volumeRange.value, gain: gainRange.value, tone: toneRange.value})
//   console.log("Presets: ", presets)
// })


// FIREBASE FUNCTIONALITY

var database = document.getElementById("database");
const db = database.db;

var presetName = document.getElementById("presetName").value
var volume = document.getElementById("volumeRange").value
var gain = document.getElementById("gainRange").value
var tone = document.getElementById("toneRange").value

// document.querySelector("#savePreset").addEventListener("click", function() {
//   database.insertData(presetName, volume, gain, tone);
// })


// BLUETOOTH LOW ENERGY FUNCTIONALITY


var deviceName = "Nano 33 IoT"
var bleService = '0000180a-0000-1000-8000-00805f9b34fb'
var bleCharacteristic = '00002a57-0000-1000-8000-00805f9b34fb'
var bluetoothDeviceDetected
var gattService;
var gattCharacteristic;
var isConnected = false;


document.querySelector("#connect").addEventListener("click", function() {
  if (isWebBluetoothEnabled()){
    read()
  }
})
document.querySelector("#start").addEventListener("click", function(event) {
  if (isWebBluetoothEnabled()){
    start()
  }
})
document.querySelector("#stop").addEventListener("click", function(event) {
  if (isWebBluetoothEnabled()){
    stop()
  }
})

async function writeToCharacteristic(value) {
  try {
    // Request the Bluetooth device
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: deviceName }],
      optionalServices: [bleService],
    });

    // Connect to the GATT server of the selected device
    const server = await device.gatt.connect();

    // Get the GATT service
    const service = await server.getPrimaryService(bleService);

    // Get the GATT characteristic you want to write to
    const characteristic = await service.getCharacteristic(bleCharacteristic);

    // Convert the value to Uint8Array or any other appropriate data type
    const data = new Uint8Array([value]); // Assuming you want to write a single byte

    // Perform the write operation
    await characteristic.writeValue(data);

    console.log('Write operation successful!');
  } catch (error) {
    console.log('Error during write: ', error);
  }
}


function isWebBluetoothEnabled() {
  if (!navigator.bluetooth) {
    console.log('Web Bluetooth API is not available in this browser!')
    return false
  }

  return true
}

function getDeviceInfo() {
  let options = {
    optionalServices: [bleService],
    filters: [
      { "name": deviceName }
    ]
  }

  console.log('Requesting any Bluetooth Device...')
  return navigator.bluetooth.requestDevice(options).then(device => {
    bluetoothDeviceDetected = device
  }).catch(error => {
    console.log('Argh! ' + error)
  })
}

// document.querySelector('form').addEventListener('submit',
//   function(event){
//     event.stopPropagation()
//     event.preventDefault() 

//     if(iswebBluetoothEnabled){
//       getDeviceInfo()
//     }
//   }
// )

function read() {
  return (bluetoothDeviceDetected ? Promise.resolve() : getDeviceInfo())
  .then(connectGATT)
  .then(_ => {
    console.log('Reading UV Index...')
    return gattCharacteristic.readValue()
  })
  .catch(error => {
    console.log('Waiting to start reading: ' + error)
  })
}

// function connectGATT() {
//   if (bluetoothDeviceDetected.gatt.connected && gattCharacteristic) {
//     return Promise.resolve()
//   }

//   return bluetoothDeviceDetected.gatt.connect()
//   .then(server => {
//     console.log('Getting GATT Service...')
//     return server.getPrimaryService(bleService)
//   })
//   .then(service => {
//     console.log('Getting GATT Characteristic...')
//     return service.getCharacteristic(bleCharacteristic)
//   })
//   .then(characteristic => {
//     gattCharacteristic = characteristic
//     gattCharacteristic.addEventListener('characteristicvaluechanged',
//         handleChangedValue)
//     document.querySelector('#start').disabled = false
//     document.querySelector('#stop').disabled = true
//   })
// }

async function connectGATT() {
  if (isConnected) {
    return Promise.resolve();
  }

  try {
    const server = await bluetoothDeviceDetected.gatt.connect();
    console.log('Getting GATT Service...');
    const service = await server.getPrimaryService(bleService);
    console.log('Getting GATT Characteristic...');
    gattCharacteristic = await service.getCharacteristic(bleCharacteristic);
    gattCharacteristic.addEventListener('characteristicvaluechanged', handleChangedValue);
    document.querySelector('#start').disabled = false;
    document.querySelector('#stop').disabled = true;
    isConnected = true; // Update the flag to indicate that the connection is established
  } catch (error) {
    console.log('[ERROR] GATT Connection: ' + error);
  }
}

function handleChangedValue(event) {
  let value = event.target.value.getUint8(0)
  var now = new Date()
  console.log('> ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ' UV Index is ' + value)
}

async function start() {
  await connectGATT(); // Make sure the GATT connection is established before starting notifications
  try {
    gattCharacteristic.startNotifications();
    console.log('Start reading...');
    document.querySelector('#start').disabled = true;
    document.querySelector('#stop').disabled = false;
  } catch (error) {
    console.log('[ERROR] Start: ' + error);
  }
}

function stop() {
  gattCharacteristic.stopNotifications()
  .then(_ => {
    console.log('Stop reading...')
    document.querySelector('#start').disabled = false
    document.querySelector('#stop').disabled = true
  })
  .catch(error => {
    console.log('[ERROR] Stop: ' + error)
  })
}