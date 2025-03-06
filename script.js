let products = [];
const video = document.getElementById('video');
const canvas = document.getElementById('photo');
const preview = document.getElementById('preview');
let latestBarcode = ''; // To store the latest scanned barcode

// Initialize camera for phone (rear camera)
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            scanBarcode();
        };
    } catch (err) {
        console.error('Camera error:', err);
        alert('Unable to access camera: ' + err.message);
    }
}

// Scan barcode
async function scanBarcode() {
    if (!('BarcodeDetector' in window)) {
        alert('Barcode detection not supported!');
        return;
    }
    const detector = new BarcodeDetector({ 
        formats: ['ean_13', 'code_128', 'qr_code', 'upc_a', 'upc_e', 'ean_8', 'code_39', 'code_93'] 
    });
    setInterval(async () => {
        try {
            const barcodes = await detector.detect(video);
            if (barcodes.length > 0) {
                latestBarcode = barcodes[0].rawValue;
                document.getElementById('barcode').value = latestBarcode; // Auto-fill the barcode
            }
        } catch (err) {
            console.error('Barcode scan error:', err);
        }
    }, 1000);
}

// Capture photo
function capturePhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    preview.src = canvas.toDataURL('image/jpeg');
}

// Capture barcode
function captureBarcode() {
    if (latestBarcode) {
        document.getElementById('barcode').value = latestBarcode;
    } else {
        alert('No barcode found yet! Point the camera at a barcode.');
    }
}

// Save product to server
async function saveProduct() {
    const barcode = document.getElementById('barcode').value;
    if (!barcode) {
        alert('Please snap a barcode first!');
        return;
    }

    const product = {
        barcode: barcode,
        photo: preview.src,
        quantity: document.getElementById('quantity').value || '1',
        location: document.getElementById('location').value || 'Unknown',
        timestamp: new Date().toISOString().replace(/[:.]/g, '-') // Safe filename
    };

    try {
        const response = await fetch('/save-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            clearForm();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (err) {
        console.error('Save error:', err);
        alert('Failed to save product!');
    }
}

// Clear form
function clearForm() {
    document.getElementById('barcode').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('location').value = '';
    preview.src = '';
    latestBarcode = '';
}

// Show records (not needed for server, but keeping it for now)
function showRecords() {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('records').style.display = 'block';
    document.getElementById('recordsList').textContent = 'Records are saved as files on the server!';
}

// Hide records
function hideRecords() {
    document.getElementById('records').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
}

// Start the app
window.onload = () => {
    initCamera();
};
