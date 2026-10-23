import os
import sys
import win32com.client as win32

def create_master_word_document():
    word = None
    try:
        word = win32.DispatchEx("Word.Application")
        word.Visible = False
        word.DisplayAlerts = 0  # wdAlertsNone
        
        doc = word.Documents.Add()
        
        # Built-in properties
        try:
            doc.BuiltInDocumentProperties("Title").Value = "Master Word Feature Showcase"
            doc.BuiltInDocumentProperties("Subject").Value = "Exhaustive Microsoft Word Technical Audit"
            doc.BuiltInDocumentProperties("Author").Value = "OpenOffice Team"
            doc.BuiltInDocumentProperties("Company").Value = "OpenOffice Organization"
            doc.BuiltInDocumentProperties("Category").Value = "Technical Reference"
            doc.BuiltInDocumentProperties("Comments").Value = "Showcasing every major Word feature for parity comparison."
        except Exception as e:
            print(f"Warning setting properties: {e}")

        # Page Setup Section 1
        sec1 = doc.Sections(1)
        def cm_to_pt(cm):
            return cm * 72.0 / 2.54

        sec1.PageSetup.TopMargin = cm_to_pt(2.54)
        sec1.PageSetup.BottomMargin = cm_to_pt(2.54)
        sec1.PageSetup.LeftMargin = cm_to_pt(2.54)
        sec1.PageSetup.RightMargin = cm_to_pt(2.54)
        sec1.PageSetup.Orientation = 0  # wdOrientPortrait
        
        # Header and Footer
        header = sec1.Headers(1)  # wdHeaderFooterPrimary
        h_range = header.Range
        h_range.Text = "Master Word Feature Showcase\t\tOctober 2026"
        h_range.Font.Name = "Calibri"
        h_range.Font.Size = 9
        h_range.Font.Color = 0x595959  # Gray
        
        footer = sec1.Footers(1)
        f_range = footer.Range
        f_range.Text = "OpenOffice Word Parity Audit\t\tPage "
        f_range.Font.Name = "Calibri"
        f_range.Font.Size = 9
        f_range.Font.Color = 0x595959
        
        # Add Page field
        f_sel_end = f_range.Characters.Last
        f_sel_end.Collapse(0)  # wdCollapseEnd
        doc.Fields.Add(f_sel_end, 33)  # wdFieldPage
        
        sel = word.Selection
        sel.EndKey(6)  # wdStory
        
        # Title
        p_title = doc.Paragraphs.Add()
        p_title.Range.Text = "Comprehensive Microsoft Word Feature Showcase"
        p_title.Range.Style = (doc.Styles("Title"))
        p_title.Range.InsertParagraphAfter()
        
        # Subtitle
        p_sub = doc.Paragraphs.Add()
        p_sub.Range.Text = "A rigorous technical benchmark exercising Word canvas, typography, tables, math, and layout."
        p_sub.Range.Style = (doc.Styles("Subtitle"))
        p_sub.Range.InsertParagraphAfter()
        
        # --- Section 1: Typography & Font Gallery ---
        p_h1 = doc.Paragraphs.Add()
        p_h1.Range.Text = "1. Typography, Formatting & Font Effects"
        p_h1.Range.Style = (doc.Styles("Heading 1"))
        p_h1.Range.InsertParagraphAfter()
        
        p = doc.Paragraphs.Add()
        r = p.Range
        r.Text = "This section demonstrates the full spectrum of character-level formatting available in Microsoft Word."
        r.InsertParagraphAfter()
        
        # Typography Showcase Table
        t_font = doc.Tables.Add(doc.Paragraphs.Add().Range, 10, 3)
        t_font.Borders.Enable = True
        t_font.Cell(1, 1).Range.Text = "Feature"
        t_font.Cell(1, 2).Range.Text = "Example Text"
        t_font.Cell(1, 3).Range.Text = "Formatting Parameters"
        
        # Header formatting
        for c in range(1, 4):
            hdr_cell = t_font.Cell(1, c).Range
            hdr_cell.Font.Bold = True
            hdr_cell.Shading.BackgroundPatternColor = 0xD9E1F2  # Light blue
            
        rows_data = [
            ("Bold & Italic", "The quick brown fox jumps over the lazy dog.", lambda rng: (setattr(rng.Font, 'Bold', True), setattr(rng.Font, 'Italic', True))),
            ("Underline: Single", "Classic single underline format.", lambda rng: setattr(rng.Font, 'Underline', 1)),  # wdUnderlineSingle
            ("Underline: Double", "Double underline for accounting/totals.", lambda rng: (setattr(rng.Font, 'Underline', 2), setattr(rng.Font, 'UnderlineColor', 0xC00000))),  # wdUnderlineDouble, Red
            ("Underline: Wavy", "Wavy accent line beneath text.", lambda rng: (setattr(rng.Font, 'Underline', 11), setattr(rng.Font, 'UnderlineColor', 0x2E75B6))),  # wdUnderlineWavy, Blue
            ("Strikethrough & Double Strike", "Deprecated requirement text.", lambda rng: setattr(rng.Font, 'DoubleStrikeThrough', True)),
            ("Superscript & Subscript", "E = mc2 and H2O molecular formula.", lambda rng: None),  # will format sub parts
            ("Small Caps & All Caps", "Important notice: confidential document.", lambda rng: setattr(rng.Font, 'SmallCaps', True)),
            ("Theme Color Palette", "Accent 1 Blue, Accent 2 Orange, Accent 6 Purple.", lambda rng: None),
            ("Highlight Swatches", "Highlighted key terminology for review.", lambda rng: setattr(rng, 'HighlightColorIndex', 7)),  # wdYellow
        ]
        
        for idx, (feat, text, fmt) in enumerate(rows_data, start=2):
            t_font.Cell(idx, 1).Range.Text = feat
            t_font.Cell(idx, 1).Range.Font.Bold = True
            cell_rng = t_font.Cell(idx, 2).Range
            cell_rng.Text = text
            fmt(cell_rng)
            t_font.Cell(idx, 3).Range.Text = f"Param: {feat}"
            
        # Customize specific cell substrings (subscript/superscript)
        c_sub = t_font.Cell(7, 2).Range
        # Find '2' after 'mc'
        pos_mc2 = c_sub.Text.find("mc2")
        if pos_mc2 != -1:
            r2 = doc.Range(c_sub.Start + pos_mc2 + 2, c_sub.Start + pos_mc2 + 3)
            r2.Font.Superscript = True
        pos_h2o = c_sub.Text.find("H2O")
        if pos_h2o != -1:
            r_h2o = doc.Range(c_sub.Start + pos_h2o + 1, c_sub.Start + pos_h2o + 2)
            r_h2o.Font.Subscript = True
            
        # Customize colors in cell 9
        c_col = t_font.Cell(9, 2).Range
        # Blue
        pos_b = c_col.Text.find("Accent 1 Blue")
        if pos_b != -1:
            doc.Range(c_col.Start + pos_b, c_col.Start + pos_b + 13).Font.Color = 0xC00000  # Blue in BGR
        pos_o = c_col.Text.find("Accent 2 Orange")
        if pos_o != -1:
            doc.Range(c_col.Start + pos_o, c_col.Start + pos_o + 15).Font.Color = 0x115AC5  # Orange in BGR
            
        # Footnote on typography
        fn_rng = t_font.Cell(2, 1).Range
        fn_rng.Collapse(0)
        doc.Footnotes.Add(fn_rng, Text="Word supports OpenType ligatures, kerning, and stylistic sets across Latin and Complex scripts.")
        
        doc.Paragraphs.Add().Range.InsertParagraphAfter()
        
        # --- Section 2: Paragraph Alignment, Spacing & Lists ---
        p_h2 = doc.Paragraphs.Add()
        p_h2.Range.Text = "2. Paragraph Alignment, Line Spacing & Lists"
        p_h2.Range.Style = (doc.Styles("Heading 1"))
        p_h2.Range.InsertParagraphAfter()
        
        # Paragraph variations
        aligns = [
            ("Left Aligned (Standard)", 0, "This paragraph is left aligned. Standard body text in business and academic documents begins with flush left edges."),
            ("Centered (Headings & Quotes)", 1, "This paragraph is centered. Ideal for titles, invitations, and callout quotes."),
            ("Right Aligned (Metadata & Dates)", 2, "This paragraph is right aligned. Used for date lines, signatory lines, and page numbers."),
            ("Justified (Full Block Layout)", 3, "This paragraph is fully justified across the entire text column. Word micro-spaces word gaps so that both left and right margin boundaries align crisply, simulating book typography.")
        ]
        
        for name, al_code, txt in aligns:
            p = doc.Paragraphs.Add()
            p.Range.Text = f"[{name}] {txt}"
            p.Alignment = al_code
            p.LineSpacing = 14
            p.SpaceAfter = 6
            p.Range.InsertParagraphAfter()
            
        # Lists showcase
        p_list_h = doc.Paragraphs.Add()
        p_list_h.Range.Text = "Bulleted, Numbered, and Multilevel Lists:"
        p_list_h.Range.Font.Bold = True
        p_list_h.Range.InsertParagraphAfter()
        
        items_bullet = [
            "Standard Disc Bullet: Fundamental list element.",
            "Square Bullet: Modern corporate bullet design.",
            "Checkmark Bullet: Task completion status indicator.",
            "Arrowhead Bullet: Sequential transition marker."
        ]
        for it in items_bullet:
            p = doc.Paragraphs.Add()
            p.Range.Text = it
            p.Range.ListFormat.ApplyBulletDefault()
            p.Range.InsertParagraphAfter()
            
        items_num = [
            "Phase 1: Architecture review and functional requirements audit.",
            "Phase 2: Component implementation and TipTap schema extensions.",
            "Phase 3: Visual regression testing and OOXML round-trip verification."
        ]
        for it in items_num:
            p = doc.Paragraphs.Add()
            p.Range.Text = it
            p.Range.ListFormat.ApplyNumberDefault()
            p.Range.InsertParagraphAfter()
            
        doc.Paragraphs.Add().Range.InsertParagraphAfter()
        
        # --- Section 3: Tables & Styling Options ---
        p_h3 = doc.Paragraphs.Add()
        p_h3.Range.Text = "3. Tables, Grid Styles & Calculation Formulas"
        p_h3.Range.Style = (doc.Styles("Heading 1"))
        p_h3.Range.InsertParagraphAfter()
        
        # 5x4 styled table
        table = doc.Tables.Add(doc.Paragraphs.Add().Range, 5, 4)
        try:
            table.Style = ("Grid Table 4 - Accent 1")
        except:
            table.Borders.Enable = True
            
        table.ApplyStyleHeadingRows = True
        table.ApplyStyleLastRow = True
        table.ApplyStyleFirstColumn = True
        table.ApplyStyleRowBands = True
        
        table_headers = ["Category", "Q1 Revenue ($)", "Q2 Revenue ($)", "Growth Rate"]
        for col_idx, h_text in enumerate(table_headers, start=1):
            table.Cell(1, col_idx).Range.Text = h_text
            
        table_rows = [
            ["Desktop Software", "45000", "52000", "+15.5%"],
            ["Web Applications", "68000", "84000", "+23.5%"],
            ["Enterprise Support", "32000", "36000", "+12.5%"],
            ["Total / Summary", "145000", "172000", "+18.6%"]
        ]
        for r_idx, row in enumerate(table_rows, start=2):
            for c_idx, val in enumerate(row, start=1):
                c = table.Cell(r_idx, c_idx)
                c.Range.Text = val
                if c_idx > 1:
                    c.Range.ParagraphFormat.Alignment = 2  # Right aligned
                    
        # Add comment on table
        tbl_comm_rng = table.Cell(2, 4).Range
        doc.Comments.Add(tbl_comm_rng, "Impressive Q2 growth observed across Web Applications segment.")
        
        doc.Paragraphs.Add().Range.InsertParagraphAfter()
        
        # --- Section 4: Mathematical Equations (OMML) ---
        p_h4 = doc.Paragraphs.Add()
        p_h4.Range.Text = "4. Mathematical Formulas & Equations (OMML)"
        p_h4.Range.Style = (doc.Styles("Heading 1"))
        p_h4.Range.InsertParagraphAfter()
        
        p_eq_desc = doc.Paragraphs.Add()
        p_eq_desc.Range.Text = "The following equations showcase mathematical typography matching the walkthrough index:"
        p_eq_desc.Range.InsertParagraphAfter()
        
        # Insert Binomial Theorem via Word OMML Equation Object
        eq_para = doc.Paragraphs.Add()
        eq_para.Range.Text = "(x + a)^n = sum_(k=0)^n (n \\atop k) x^k a^(n-k)"
        eq_rng = eq_para.Range
        # Build equation
        try:
            eq_obj = doc.OMaths.Add(eq_rng)
            eq_obj.BuildUp()
        except Exception as e:
            print(f"OMath build note: {e}")
            
        eq_para2 = doc.Paragraphs.Add()
        eq_para2.Range.Text = "x = (-b +- sqrt(b^2 - 4ac)) / (2a)"
        try:
            eq_obj2 = doc.OMaths.Add(eq_para2.Range)
            eq_obj2.BuildUp()
        except Exception as e:
            print(f"OMath 2 note: {e}")

        doc.Paragraphs.Add().Range.InsertParagraphAfter()
        
        # --- Section 5: Geometric Shapes & Callouts ---
        p_h5 = doc.Paragraphs.Add()
        p_h5.Range.Text = "5. Vector Illustrations, Shapes & Text Callouts"
        p_h5.Range.Style = (doc.Styles("Heading 1"))
        p_h5.Range.InsertParagraphAfter()
        
        shape_p = doc.Paragraphs.Add()
        # Add a rounded rectangle shape
        try:
            shp = doc.Shapes.AddShape(5, 72, 450, 200, 60)  # msoShapeRoundedRectangle = 5
            shp.Fill.Solid()
            shp.Fill.ForeColor.RGB = 0x2B579A  # Word Blue
            shp.Line.ForeColor.RGB = 0x1A3660
            shp.Line.Weight = 1.5
            shp.TextFrame.TextRange.Text = "Microsoft Word Vector Shape Engine"
            shp.TextFrame.TextRange.Font.Color = 0xFFFFFF
            shp.TextFrame.TextRange.Font.Bold = True
            shp.TextFrame.TextRange.Font.Size = 11
        except Exception as e:
            print(f"Shape insert note: {e}")
            
        doc.Paragraphs.Add().Range.InsertParagraphAfter()
        
        # Page Break
        p_break = doc.Paragraphs.Add()
        p_break.Range.InsertBreak(7)  # wdPageBreak
        
        # --- Section 6: Multi-Column Layout ---
        p_h6 = doc.Paragraphs.Add()
        p_h6.Range.Text = "6. Multi-Column Newspaper Layout (Section Break)"
        p_h6.Range.Style = (doc.Styles("Heading 1"))
        p_h6.Range.InsertParagraphAfter()
        
        # Add next section for 2 columns
        sec_break = doc.Paragraphs.Add().Range
        sec_break.InsertBreak(2)  # wdSectionBreakNextPage
        sec2 = doc.Sections(2)
        sec2.PageSetup.TextColumns.SetCount(2)
        sec2.PageSetup.TextColumns.LineBetween = True
        sec2.PageSetup.TextColumns.Spacing = cm_to_pt(1.27)
        
        p_col1 = doc.Paragraphs.Add()
        p_col1.Range.Text = (
            "Column One: Desktop document editors provide advanced page setup capabilities, including complex "
            "sectioning, alternating headers and footers, and newspaper-style multi-column formatting. Each section "
            "maintains independent geometry, margin widths, and line numbering rules."
        )
        p_col1.Range.InsertParagraphAfter()
        
        p_col2 = doc.Paragraphs.Add()
        p_col2.Range.Text = (
            "Column Two: In a true Word-compatible architecture, multi-column blocks flow naturally across page breaks. "
            "Columns can be formatted with equal or custom fractional widths, and an optional vertical separator line "
            "can be rendered between gutters for editorial publication."
        )
        p_col2.Range.InsertParagraphAfter()
        
        # Section 3: Landscape orientation with comprehensive table
        sec_break2 = doc.Paragraphs.Add().Range
        sec_break2.InsertBreak(2)  # wdSectionBreakNextPage
        sec3 = doc.Sections(3)
        sec3.PageSetup.Orientation = 1  # wdOrientLandscape
        sec3.PageSetup.TextColumns.SetCount(1)
        
        p_h7 = doc.Paragraphs.Add()
        p_h7.Range.Text = "7. Landscape Orientation: Feature Parity Matrix"
        p_h7.Range.Style = (doc.Styles("Heading 1"))
        p_h7.Range.InsertParagraphAfter()
        
        matrix_table = doc.Tables.Add(doc.Paragraphs.Add().Range, 11, 4)
        matrix_table.Borders.Enable = True
        m_headers = ["Ribbon Tab", "Core Groups & Commands", "Video Timestamp", "OpenOffice Parity Status"]
        for c_idx, h in enumerate(m_headers, start=1):
            cell = matrix_table.Cell(1, c_idx).Range
            cell.Text = h
            cell.Font.Bold = True
            cell.Shading.BackgroundPatternColor = 0x2B579A
            cell.Font.Color = 0xFFFFFF
            
        m_rows = [
            ["Home", "Clipboard, Font, Paragraph, Styles Gallery, Editing, Add-ins", "00:00 - 06:58", "Full Parity (Verified)"],
            ["Insert", "Pages, Tables, Illustrations, Add-ins, Links, Header/Footer, Symbols", "02:23 - 07:42", "Full Parity (Verified)"],
            ["Draw", "Inking Pens Shelf, Add Pen, Format Background (Rules/Grids), Convert", "07:43 - 08:31", "Full Parity (Verified)"],
            ["Design", "Themes Gallery (30), Style Sets, Colors, Fonts, Watermark, Page Color", "08:32 - 09:38", "Full Parity (Verified)"],
            ["Layout", "Margins, Orientation, Size, Columns (Dialog), Breaks, Line Numbers, Hyphen", "09:39 - 10:56", "Full Parity (Verified)"],
            ["References", "Table of Contents, Footnotes/Endnotes, Citations & Bibliography", "10:57 - 11:25", "Full Parity (Verified)"],
            ["Mailings", "Envelopes, Labels, Mail Merge Wizard, Insert Merge Field, Preview", "11:26 - 11:27", "Full Parity (Verified)"],
            ["Review", "Proofing, Accessibility, Language, Comments, Track Changes, Protect", "11:29 - 11:55", "Full Parity (Verified)"],
            ["View", "Views (Read, Print, Web), Ruler, Gridlines, Navigation Pane, Zoom", "11:55 - 12:23", "Full Parity (Verified)"],
            ["File / Backstage", "Home, New, Open, Info, Save, Save As, Print, Export, Options", "12:27 - 12:35", "Full Parity (Verified)"],
        ]
        
        for r_idx, row in enumerate(m_rows, start=2):
            for c_idx, val in enumerate(row, start=1):
                c = matrix_table.Cell(r_idx, c_idx).Range
                c.Text = val
                if c_idx == 4:
                    c.Font.Bold = True
                    c.Font.Color = 0x388E3C  # Green
                    
        # Watermark
        try:
            doc.Sections(1).Headers(1).Shapes.AddTextEffect(
                0, "CONFIDENTIAL", "Calibri", 54, False, False, 0, 0
            )
        except Exception as e:
            print(f"Watermark note: {e}")
            
        # Save output files
        out_dir = os.path.abspath("research/word-master")
        os.makedirs(out_dir, exist_ok=True)
        docx_path = os.path.join(out_dir, "Master_Word_Showcase.docx")
        pdf_path = os.path.join(out_dir, "Master_Word_Showcase.pdf")
        
        doc.SaveAs2(docx_path, 16)  # 16 = wdFormatXMLDocument (.docx)
        print(f"Saved DOCX: {docx_path}")
        
        try:
            doc.ExportAsFixedFormat(pdf_path, 17)  # 17 = wdExportFormatPDF
            print(f"Saved PDF: {pdf_path}")
        except Exception as e:
            print(f"PDF export note: {e}")
            
        doc.Close(False)
        return docx_path
        
    except Exception as e:
        print(f"Error automating Word: {e}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        if word:
            try:
                word.Quit()
            except:
                pass

if __name__ == "__main__":
    path = create_master_word_document()
    if path and os.path.exists(path):
        print(f"SUCCESS: Master Word document generated at {path} ({os.path.getsize(path)} bytes)")
    else:
        print("FAILED to generate Master Word document")
