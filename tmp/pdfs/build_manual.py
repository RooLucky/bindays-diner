from pathlib import Path
from io import BytesIO
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

ROOT = Path('C:/2026/bindays-diner')
OUT = ROOT / 'output/pdf/bindays-diner-admin-user-manual.pdf'
W,H = 960,640
RED=HexColor('#cf1915'); OLIVE=HexColor('#72782c'); INK=HexColor('#20221b'); MUTED=HexColor('#62645b'); CREAM=HexColor('#fcf7ee')
c=canvas.Canvas(str(OUT),pagesize=(W,H))
c.setTitle("Binday's Diner - Administration User Manual")
c.setAuthor("Binday's Diner")
style=ParagraphStyle('body',fontName='Helvetica',fontSize=11,leading=16,textColor=INK)

def para(text,x,y,width,size=11,color=INK,bold=False):
    st=ParagraphStyle('p',parent=style,fontName='Helvetica-Bold' if bold else 'Helvetica',fontSize=size,leading=size*1.4,textColor=color)
    p=Paragraph(text,st); _,h=p.wrap(width,1000);p.drawOn(c,x,y-h);return y-h

def base(section,title,subtitle,page):
    c.setFillColor(CREAM);c.rect(0,0,W,H,fill=1,stroke=0)
    c.setFillColor(OLIVE);c.rect(0,H-8,W,8,fill=1,stroke=0)
    para("BINDAY'S DINER  /  ADMINISTRATION USER MANUAL",32,610,800,10,OLIVE,True)
    para(section.upper(),32,581,800,10,RED,True)
    para(title,32,560,900,25,INK,True)
    para(subtitle,32,520,896,11,MUTED)
    c.setStrokeColor(HexColor('#dfd9cd'));c.line(32,35,928,35)
    para('Staff guide  |  09 October 2026',32,25,500,9,MUTED)
    c.setFont('Helvetica',9);c.setFillColor(MUTED);c.drawRightString(928,16,f'{page:02d}')

def screenshot(name, marks, crop=None):
    im=Image.open(ROOT/'public/manual'/name).convert('RGB')
    # Coordinates use the inspected 2048 x 997 reference; preserve original pixels.
    sx,sy=im.width/2048,im.height/997
    cr=crop or (0,0,2048,997)
    im=im.crop(tuple(round(v*(sx if i%2==0 else sy)) for i,v in enumerate(cr)))
    x,y,bw,bh=32,103,640,383
    scale=min(bw/im.width,bh/im.height); dw,dh=im.width*scale,im.height*scale
    ix,iy=x+(bw-dw)/2,y+(bh-dh)/2
    c.setFillColor(white);c.roundRect(x-1,y-1,bw+2,bh+2,8,fill=1,stroke=0)
    c.drawImage(ImageReader(im),ix,iy,dw,dh)
    def point(px,py):return ix+(px-cr[0])*sx*scale,iy+dh-(py-cr[1])*sy*scale
    for n,(x1,y1,x2,y2) in enumerate(marks,1):
        ax,ay=point(x1,y2);bx,by=point(x2,y1)
        c.setStrokeColor(RED);c.setLineWidth(2.2);c.roundRect(ax-3,ay-3,bx-ax+6,by-ay+6,5,stroke=1,fill=0)
        cx=max(ix+10,ax-13);cy=min(iy+dh-10,by+12)
        c.line(cx+5,cy-5,ax,by)
        c.setFillColor(RED);c.circle(cx,cy,9,fill=1,stroke=0)
        c.setFillColor(white);c.setFont('Helvetica-Bold',10);c.drawCentredString(cx,cy-3.5,str(n))

def page(section,title,subtitle,name,marks,steps,result,crop=None,note=None):
    global num
    num+=1;base(section,title,subtitle,num);screenshot(name,marks,crop)
    y=478
    for i,(head,body) in enumerate(steps,1):
        c.setFillColor(RED);c.circle(703,y-9,10,fill=1,stroke=0);c.setFillColor(white);c.setFont('Helvetica-Bold',10);c.drawCentredString(703,y-12.5,str(i))
        y=para(head,723,y,205,12,INK,True)-7
        y=para(body,693,y,235,11)-22
    if note: para(note,693,y,235,10,MUTED)
    c.setFillColor(HexColor('#eeefd9'));c.roundRect(32,49,896,43,7,fill=1,stroke=0)
    para('<b>Check the result:</b> '+result,45,79,868,10)
    c.showPage()

num=1
base('Start here','Manage the website with confidence','A visual, click-by-click guide using the supplied management screenshots.',num)
c.setFillColor(OLIVE);c.roundRect(32,166,385,320,12,fill=1,stroke=0)
para('CLICK<br/>COMPLETE<br/>SAVE<br/>CHECK',58,453,333,34,white,True)
para('Follow the red numbered highlights.<br/>Each page explains the action and the result to look for.',58,244,325,13,white)
para('IN THIS MANUAL',451,476,450,12,OLIVE,True)
for y,text in [(444,'02  Categories: create, rename and delete'),(412,'03-05  Main Dishes: add an item and check the table'),(380,'06-07  Main Dishes: edit an existing item'),(348,'08-09  Main Dishes: delete with confirmation'),(316,'10  Header navigation: show or hide menu links'),(284,'11-13  Chatbot knowledge: add and maintain answers')]:para(text,451,y,465,12)
para('Before you begin',451,239,450,13,INK,True)
para('Sign in with an authorized staff account. Main Dishes is the example for other menu catalog and featured-menu pages; fields may vary.',451,216,460,11)
para('Screenshot scope: Categories, Main Dishes, Header Navigation and Chatbot Knowledge. Table images are reference views, not proof that a sample change was saved.',32,139,890,10,MUTED)
c.showPage()

page('Categories','Organize reusable category labels','Open Categories from the sidebar before assigning a category to a menu item.',
'Categories.png',[(1816,122,1983,172),(1873,408,1915,451),(1922,408,1963,451)],
[('Add a category','Click <b>Add category</b>. Enter the category name in the dialog, then click <b>Add category</b> to save.'),('Rename a category','Click the pencil beside the correct row. Update its name and click <b>Save changes</b>.'),('Delete a category','Click the trash icon. Check the category name in the confirmation dialog before choosing <b>Delete</b>. Use Cancel to keep it.')],
'A saved label appears in Category Options. Confirm the spelling and use it in the item form.',note='The supplied screenshot shows the category table; its dialogs are described here.')

page('Main Dishes / Add / 1 of 3','Open the Create Item dialog','Start from Menu catalog > Main dishes.',
'Main Dishes.png',[(19,286,299,332),(1851,124,1982,170)],
[('Choose Main dishes','Click <b>Main dishes</b> in the sidebar. The Main Dish page lists the current menu items.'),('Click Add Item','Click the red <b>Add Item</b> button at the upper right. This opens the <b>Create Item</b> modal shown on the next page.')],
'The Create Item dialog opens over the table. No item is saved until you submit the form.')

page('Main Dishes / Add / 2 of 3','Fill in the item, then create it','Use one real menu item as your example; enter the restaurant-approved details.',
'Add Main dish.png',[(582,304,1447,617),(582,637,1447,720),(1294,733,1449,787)],
[('Enter the menu details','Fill in <b>Name</b>, <b>Price</b>, Category, Sort and Description. Keep <b>Active</b> on if the item should appear to customers.'),('Add the image details','Enter descriptive Image Alt Text, then choose the food photo. Example price format: <b>P59</b>, as shown in the edit example.'),('Click Create Item','Review the fields, then click <b>Create Item</b> once. Wait for the save to finish. If an error appears, correct it before retrying.')],
'After a successful save, the modal closes and the item is added to the menu table.',crop=(535,170,1490,829))

page('Main Dishes / Add / 3 of 3','Confirm the saved item in the table','This reference table shows where to verify your newly created item.',
'Main Dishes.png',[(379,345,844,391),(613,478,1450,544),(1633,495,1704,534)],
[('Search for the name','Enter the name you just saved in <b>Search name or category</b>. Keep Status set to <b>All items</b> while checking.'),('Compare the row','Confirm the name, description, price and category match your form. The item may be on another page because of its Sort value.'),('Check visibility','Confirm the status is <b>Active</b> if the item should be public. Use <b>View website</b> to check the customer menu.')],
'Your saved item appears with the intended details. The pictured Goto Plain row is an existing example, not a newly added record.')

page('Main Dishes / Edit / 1 of 2','Choose the item to edit','Search for the item first, then use the pencil in that same row.',
'Main Dishes.png',[(379,345,844,391),(1873,493,1916,536)],
[('Find the correct row','Search by name or category. Double-check the item name before editing; this example uses <b>Goto Plain</b>.'),('Click the pencil','Click the pencil under <b>Actions</b>. The <b>Edit Item</b> modal opens with the existing details already filled in.')],
'The Edit Item dialog displays the selected item, as shown on the next page.')

page('Main Dishes / Edit / 2 of 2','Update the details and save','The screenshot uses Goto Plain as the edit example.',
'edit main dish.png',[(582,305,1447,719),(1308,733,1449,787)],
[('Change the needed fields','Edit the name, price, category, sort order, description or image details. Turn <b>Active</b> off to hide an item without deleting it.'),('Click Save Item','Click <b>Save Item</b> and wait for completion. Use Cancel or the close button if you do not want to save your changes.')],
'The modal closes after saving. Search the table again and confirm the changed values.',crop=(535,170,1490,829))

page('Main Dishes / Delete / 1 of 2','Select the correct item for deletion','Use the trash icon only for an item that should be removed.',
'Main Dishes.png',[(616,479,1080,549),(1921,493,1963,536)],
[('Check the item name','Locate the row you want to remove. The pictured example is <b>Goto Plain</b>.'),('Click the trash icon','Click the red trash icon in that row. A confirmation modal opens before anything is deleted.')],
'The confirmation modal names the selected item. Check that name before proceeding.')

page('Main Dishes / Delete / 2 of 2','Confirm or cancel the deletion','Deletion cannot be undone through this dialog.',
'delete main dish.png',[(772,445,1010,481),(1048,573,1138,621),(1143,572,1258,622)],
[('Read the item name','Make sure the dialog names the item you intend to delete.'),('Cancel if unsure','Choose <b>Cancel</b> to close the dialog and keep the item.'),('Confirm Delete','Choose <b>Delete</b> only when the item should be permanently removed from the menu.')],
'After successful deletion, the row disappears. Search for its name to confirm it is no longer listed.',crop=(717,320,1320,676))

page('Header Navigation','Choose which menu links customers see','Open Website settings > Header navigation.',
'Header navigation.png',[(18,790,298,837),(1895,367,1957,398),(443,614,780,677)],
[('Open Header navigation','Select <b>Header navigation</b> in the sidebar.'),('Change the switch','Click the switch beside the menu link. Red/on means visible; gray/off means hidden. Changes save immediately.'),('Read the row status','Confirm the text says <b>Visible in the public header</b> or <b>Hidden from the public header</b>, as intended.')],
'Open View website and check the header. Hiding a link does not delete the menu items.')

page('Chatbot Knowledge / Add / 1 of 2','Open the approved-answer form','Open Website settings > Chatbot knowledge.',
'Chatbot.png',[(18,836,298,882),(1821,122,1983,171)],
[('Open Chatbot knowledge','Select <b>Chatbot knowledge</b>. The Approved answers table lists the knowledge available to manage.'),('Click Add Q and A','Click <b>Add Q and A</b>. This opens a dialog for the question and its approved answer.')],
'The Add Q and A modal opens. Prepare accurate restaurant information before saving.')

page('Chatbot Knowledge / Add / 2 of 2','Write an approved answer','Use clear wording that staff have checked for accuracy.',
'Chatbot - add.png',[(639,326,1390,635),(637,652,1390,710),(1213,727,1392,781)],
[('Enter the content','Fill in Question and Approved answer. Add a Category and Retrieval keywords that customers might use.'),('Set the options','Enable <b>Active for chatbot answers</b> to make it available. Enable <b>Show as a suggested question</b> only when it should be offered as a prompt.'),('Click Create answer','Click <b>Create answer</b> and wait for the dialog to close. Search the table for the question to verify it was saved.')],
'The new question and answer appear in Approved answers. Test the question in the public chatbot.',crop=(591,172,1438,824))

page('Chatbot Knowledge / Maintain','Keep existing answers accurate','Use the actions beside the answer you want to maintain.',
'Chatbot.png',[(1824,813,1867,857),(1872,813,1916,857),(1920,813,1964,857)],
[('Hide or activate','Use the eye icon to change whether an answer is active. Check the Status column after the update.'),('Edit an answer','Click the pencil, update the dialog fields, then click <b>Save changes</b>. Confirm the revised content in the table.'),('Delete an answer','Click the trash icon. Check the confirmation dialog, then Delete or Cancel as appropriate.')],
'Search the question again and check its content and status. Test public answers after updating them.',note='Sync Menu Data refreshes menu-based knowledge. Review the refreshed entries after menu changes.')
c.save()
print(f'Created {OUT} ({num} pages)')
