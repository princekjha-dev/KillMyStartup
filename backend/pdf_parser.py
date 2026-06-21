import io
import logging
import pdfplumber

logger = logging.getLogger("uvicorn.error")

def extract_text_from_pdf(pdf_bytes: bytes, max_words: int = 4000) -> str:
    """
    Parses a PDF file from bytes using pdfplumber, extracts text,
    and returns a sanitized and length-capped string.
    """
    extracted_text = []
    word_count = 0

    try:
        # Wrap bytes in a file-like object and open with pdfplumber
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page_num, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if not page_text:
                    continue

                # Basic clean up of whitespace and control characters
                words = page_text.split()
                for word in words:
                    # Clean words if necessary
                    word = "".join(c for c in word if c.isprintable())
                    extracted_text.append(word)
                    word_count += 1
                    
                    if word_count >= max_words:
                        logger.info(f"Reached max word limit of {max_words} during PDF parsing.")
                        break
                        
                if word_count >= max_words:
                    break

        full_text = " ".join(extracted_text)
        logger.info(f"Successfully extracted {word_count} words from PDF.")
        return full_text
        
    except Exception as e:
        logger.error(f"Error parsing PDF with pdfplumber: {e}")
        raise ValueError(f"Failed to parse PDF pitch deck: {str(e)}")
