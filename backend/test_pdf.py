from weasyprint import HTML

HTML(
    string="""
    <html>
        <body>
            <h1>Hello PDF</h1>
            <p>PDF generation is working.</p>
        </body>
    </html>
    """
).write_pdf("hello.pdf")

print("PDF generated successfully!")