let products = [];
const video = document.getElementById('video');
const canvas = document.getElementById('photo');
const preview = document.getElementById('preview');
let latestBarcode = '';

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
        alert('Camera error: ' + err.message);
    }
}

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
                document.getElementById('barcode').value = latestBarcode;
            }
        } catch (err) {
            console.error('Barcode scan error:', err);
        }
    }, 1000);
}

function capturePhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    preview.src = canvas.toDataURL('image/jpeg');
}

function captureBarcode() {
    if (latestBarcode) {
        document.getElementById('barcode').value = latestBarcode;
    } else {
        alert('No barcode found yet! Point the camera at a barcode.');
    }
}

function saveProduct() {
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
        timestamp: new Date().toISOString()
    };
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
    alert('Product saved on your phone!');
    clearForm();
}

function clearForm() {
    document.getElementById('barcode').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('location').value = '';
    preview.src = '';
    latestBarcode = '';
}

function showRecords() {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('records').style.display = 'block';
    products = JSON.parse(localStorage.getItem('products') || '[]');
    document.getElementById('recordsList').textContent = JSON.stringify(products, null, 2);
}

function hideRecords() {
    document.getElementById('records').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
}

window.onload = () => {
    initCamera();
};
