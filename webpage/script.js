// Get references to the HTML elements
const canvas = document.getElementById('signatureCanvas');
const context = canvas.getContext('2d');
let drawing = false;

// Set canvas dimensions
canvas.width = 300;  // Desired width of the signature canvas
canvas.height = 150; // Desired height of the signature canvas

// Start drawing on the canvas
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    context.beginPath();
    context.moveTo(e.offsetX, e.offsetY);
});

// Draw on the canvas as the mouse moves
canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        context.lineTo(e.offsetX, e.offsetY);
        context.stroke();
    }
});

// Stop drawing when the mouse is released
canvas.addEventListener('mouseup', () => {
    drawing = false;
    context.closePath();
});

// Stop drawing when the mouse leaves the canvas
canvas.addEventListener('mouseout', () => {
    drawing = false;
    context.closePath();
});

// Clear the canvas when the clear button is clicked
document.getElementById('clearButton').addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
});

// Handle form submission and generate PDF
document.getElementById('myForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const { jsPDF } = window.jspdf; // Initialize jsPDF
    const pdf = new jsPDF();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    // Load logo image
    const logoUrl = "https://raw.githubusercontent.com/edisonneza/jspdf-invoice-template/demo/images/logo.png";
    const logoImg = new Image();
    logoImg.src = logoUrl;

    logoImg.onload = function() {
        // Add logo to PDF
        pdf.addImage(logoImg, 'PNG', 10, 10, 53.33, 26.66); // Adjust dimensions and position

        // Set business info
        pdf.setFontSize(12);
		
        pdf.text("Agriculture, Environmental Affairs, Rural Development and Land Reform", 70, 20);
        pdf.text("162 George Street ,Private Bag X 5018, Kimberley, 8300", 70, 25);
        pdf.text("087 630 0387", 70, 30);
        pdf.text("email@example.com", 70, 35);
        pdf.text("http://www.agrinc.gov.za/", 70, 40);

        // Invoice information
        pdf.text("Invoice #: 19", 10, 50);
        pdf.text(`Intake Date: ${new Date().toLocaleDateString()}`, 10, 55);
        
        // Add form data to PDF
        pdf.setFontSize(18);
        pdf.text('IT Asset Intake', 10, 70);
        pdf.setFontSize(15);
        pdf.text(`Name: ${name}`, 10, 90);
        pdf.text(`Email: ${email}`, 10, 95);
        pdf.text('Signature:', 10, 100);

        // Convert the canvas to an image and add it to the PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 10, 110, 180, 80); // Adjust dimensions as needed

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
