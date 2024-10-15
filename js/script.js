// Get references to the HTML elements
const canvas = document.getElementById('signatureCanvas');
const context = canvas.getContext('2d');
let drawing = false;

// Set responsive canvas dimensions
canvas.width = canvas.offsetWidth;  // Responsive width
canvas.height = 150; // Fixed height for signature canvas

// Start drawing on the canvas
function startDrawing(e) {
    drawing = true;
    context.beginPath();
    const { offsetX, offsetY } = getPosition(e);
    context.moveTo(offsetX, offsetY);
}

// Draw on the canvas as the mouse moves or touch moves
function draw(e) {
    if (drawing) {
        const { offsetX, offsetY } = getPosition(e);
        context.lineTo(offsetX, offsetY);
        context.stroke();
    }
}

// Stop drawing
function stopDrawing() {
    drawing = false;
    context.closePath();
}

// Get position for both mouse and touch events
function getPosition(e) {
    let rect = canvas.getBoundingClientRect();
    let offsetX, offsetY;

    if (e.touches) {
        offsetX = e.touches[0].clientX - rect.left;
        offsetY = e.touches[0].clientY - rect.top;
    } else {
        offsetX = e.offsetX;
        offsetY = e.offsetY;
    }
    
    return { offsetX, offsetY };
}

// Event listeners for mouse and touch events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent scrolling
    startDrawing(e);
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling
    draw(e);
});
canvas.addEventListener('touchend', stopDrawing);

// Clear the canvas when the clear button is clicked
document.getElementById('clearButton').addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
});

// Function to check if the canvas is empty
function isCanvasEmpty() {
    const emptyImageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = emptyImageData.data;

    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] !== 0) {
            return false; // Canvas is not empty
        }
    }
    return true; // Canvas is empty
}

// Function to check if the email is verified (Gmail and Outlook)
async function isEmailVerified(email) {
    // Check if the email ends with Gmail or Outlook domains
    return new Promise((resolve) => {
        const verifiedDomains = ['gmail.com', 'outlook.com', 'hotmail.com'];
        const emailDomain = email.split('@')[1];

        // Simulating a network delay
        setTimeout(() => {
            if (verifiedDomains.includes(emailDomain)) {
                resolve(true); // Email is verified
            } else {
                resolve(false); // Email is not verified
            }
        }, 1000); // Simulating network delay
    });
}

// Handle form submission and generate PDF
document.getElementById('myForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const email = document.getElementById('email').value;

    // Check if the email is verified
    const verified = await isEmailVerified(email);
    if (!verified) {
        alert('Please verify your email (Gmail or Outlook) before submitting the form.');
        return; // Stop the submission
    }

    // Check if the canvas is empty
    if (isCanvasEmpty()) {
        alert('Please provide a signature before submitting the form.');
        return; // Stop the submission
    }

    const { jsPDF } = window.jspdf; // Initialize jsPDF
    const pdf = new jsPDF();

    const name = document.getElementById('name').value;

    // Load logo image
    const logoUrl = "https://raw.githubusercontent.com/DaerlHelpDesk/Daerlprojects/main/images/coa.png";
    const logoImg = new Image();
    logoImg.src = logoUrl;

    logoImg.onload = function() {
        // Add logo to PDF with increased size
        pdf.addImage(logoImg, 'PNG', 10, 10, 80, 40); // Adjusted width and height for a larger logo

        // Set business info with adjusted spacing
        pdf.setFontSize(12);
        pdf.text("Agriculture, Environmental Affairs, Rural Development and Land Reform", 100, 20, { maxWidth: 110 });
        pdf.text("162 George Street, Private Bag X 5018, Kimberley, 8300", 100, 25, { maxWidth: 110 });
        pdf.text("087 630 0387", 100, 30);
        pdf.text("email@example.com", 100, 35);
        pdf.text("http://www.agrinc.gov.za/", 100, 40);

        const uniqueInvoiceNumber = Math.floor(Date.now() / 60000);
        pdf.text(`Invoice #: ${uniqueInvoiceNumber}`, 10, 60); // Adjusted position for invoice number
        pdf.text(`Intake Date: ${new Date().toLocaleDateString()}`, 10, 65); // Adjusted position for intake date

        // Add form data to PDF
        pdf.setFontSize(18);
        pdf.text('IT Asset Intake', 10, 90); // Adjusted position for the title
        pdf.setFontSize(15);
        pdf.text(`Name: ${name}`, 10, 110); // Adjusted position for name
        pdf.text(`Email: ${email}`, 10, 115); // Adjusted position for email
        pdf.text('Signature:', 10, 120); // Adjusted position for signature label

        // Convert the canvas to an image and add it to the PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 10, 130, 180, 80); // Adjust dimensions and position for signature

        // Footer
        pdf.text("The invoice is created on a computer and is valid without the signature and stamp.", 10, pdf.internal.pageSize.height - 20);

        // Save the PDF
        pdf.save('form-data.pdf');

        // Clear the form fields and signature after submission
        document.getElementById('myForm').reset();
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear signature area
    };

    logoImg.onerror = function() {
        console.error('Failed to load the logo image. Please check the path.');
    };
});