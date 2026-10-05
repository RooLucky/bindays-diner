from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output/pdf'
OUT.mkdir(parents=True, exist_ok=True)
for name, file in [('Regular','segoeui.ttf'),('Bold','segoeuib.ttf')]:
    pdfmetrics.registerFont(TTFont(name, 'C:/Windows/Fonts/' + file))
W,H = 595.28,841.89
RED='#BD2529'; OLIVE='#737B37'; CREAM='#FCF7EE'; GOLD='#F1E6C7'; INK='#232624'; MUTED='#66706A'; BORDER='#DDDCD6'
c = canvas.Canvas(str(OUT/'bindays-diner-admin-user-manual.pdf'), pagesize=(W,H))
c.setTitle("Binday's Diner | Admin User Manual")
c.setAuthor("Binday's Diner")
PAGE=0

def box(x,y,w,h,fill='white',stroke=None,r=8):
    c.setFillColor(white if fill=='white' else HexColor(fill))
    c.setStrokeColor(HexColor(stroke or fill) if (stroke or fill)!='white' else white)
    c.roundRect(x,H-y-h,w,h,r,fill=1,stroke=bool(stroke))

def text(x,y,s,size=11,bold=False,color=INK):
    c.setFont('Bold' if bold else 'Regular',size); c.setFillColor(HexColor(color)); c.drawString(x,H-y-size,s)

def para(x,y,s,width=510,size=11,color=INK,bold=False):
    p=Paragraph(s,ParagraphStyle('p',fontName='Bold' if bold else 'Regular',fontSize=size,leading=size*1.45,textColor=HexColor(color),spaceAfter=0))
    _,h=p.wrap(width,1000); p.drawOn(c,x,H-y-h); return h

def rule(x,y,w):
    c.setStrokeColor(HexColor(BORDER)); c.setLineWidth(.6); c.line(x,H-y,x+w,H-y)

def button(x,y,s,w=98,primary=True):
    box(x,y,w,25,RED if primary else 'white',None if primary else BORDER,5)
    text(x+10,y+5,s,9,True,'#FFFFFF' if primary else INK)

def chip(x,y,s,w=62,on=True):
    box(x,y,w,20,GOLD if on else '#ECEDE8',r=4); text(x+7,y+4,s,8,False,OLIVE if on else MUTED)

def dot(x,y,n):
    c.setFillColor(HexColor(RED)); c.circle(x,H-y,10,fill=1,stroke=0)
    c.setFillColor(white); c.setFont('Bold',10); c.drawCentredString(x,H-y-3.5,str(n))

def field(x,y,label,value,w=215,h=29):
    text(x,y,label,8,True,MUTED); box(x,y+15,w,h,'white',BORDER,4)
    para(x+9,y+21,escape(value),w-18,9)

def switch(x,y,on=True):
    box(x,y,30,16,RED if on else '#C1C4BF',r=8)
    c.setFillColor(white); c.circle(x+(22 if on else 8),H-y-8,5,fill=1,stroke=0)

def page(title,subtitle,section):
    global PAGE
    PAGE+=1
    box(0,0,W,9,RED,r=0)
    text(38,28,"BINDAY'S DINER",11,True,RED)
    text(390,29,'ADMIN USER MANUAL',9,True,MUTED)
    text(38,64,section.upper(),9,True,OLIVE)
    text(38,84,title,26,True)
    para(38,124,subtitle,519,11,MUTED)
    rule(38,786,519)
    text(38,799,'Staff guide  |  05 October 2026  |  Interface illustrations, not screenshots',8,False,MUTED)
    text(521,798,f'{PAGE:02}',10,True,RED)
    c.bookmarkPage(f'page{PAGE}'); c.addOutlineEntry(title,f'page{PAGE}',0)

def finish(): c.showPage()

def panel(title,y=180,h=265):
    box(38,y,519,h,'white',BORDER,10)
    box(39,y+1,517,32,CREAM,r=9)
    text(52,y+10,title,10,True)
    text(413,y+11,'ILLUSTRATIVE EXAMPLE',7,True,MUTED)

def step(n,title,body,y,x=38,w=519):
    dot(x+10,y+12,n); text(x+30,y,title,12,True)
    hh=para(x+30,y+22,body,w-30,10.5,MUTED)
    return y+22+hh+14

def note(title,body,y=710):
    box(38,y,519,62,CREAM,r=8); text(52,y+10,title,10,True,OLIVE)
    para(52,y+27,body,490,9.5,MUTED)

# 1
page('Start in your workspace','A practical guide for staff managing menu content and customer experience.','01 / Getting started')
panel('Your admin workspace',180,275)
box(39,214,158,240,CREAM,r=0)
text(53,227,"Binday's Diner",12,True)
for i,s in enumerate(['Overview','Categories','MENU CATALOG','Main dishes','FEATURED MENUS','CUSTOMER EXPERIENCE','Loyalty program','Reviews','WEBSITE SETTINGS']):
    yy=257+i*20
    if s in ['Overview','Categories']: box(48,yy-2,137,19,GOLD if s=='Categories' else 'white',r=4)
    text(55,yy,s,8.2,s.isupper() or s=='Categories',OLIVE if s.isupper() else INK)
dot(189,286,1)
text(216,229,'Overview',16,True)
for xx,label,value in [(216,'Menu items','Menu'),(325,'Loyalty members','Members'),(434,'Reviews to approve','Reviews')]:
    box(xx,266,98,80,'white',BORDER,6); para(xx+9,276,label,82,8,MUTED); text(xx+9,304,value,12,True)
box(216,361,316,67,CREAM,r=6); text(228,374,'Menu at a glance',11,True); text(228,396,'Open a section to manage its content.',9,False,MUTED)
dot(535,240,2)
y=476
y=step(1,'Sign in and choose a section','Open the website login page and enter your authorized email and password. Successful login opens <b>Overview</b> at /management. <b>Categories</b> sits directly below Overview.',y)
y=step(2,'Use the navigation controls','Use the sidebar toggle to collapse the menu. On a phone, open navigation with the same toggle. <b>View website</b> opens the public site; your account menu contains <b>Sign out</b>.',y)
text(38,636,'IN THIS GUIDE',9,True,OLIVE)
para(38,657,'02 Categories   ·   03-04 Main Dishes   ·   05-06 Loyalty<br/>07 Reviews   ·   08 Header navigation   ·   09-10 Chatbot knowledge',519,11)
note('How to use the examples','Illustrations use sample values and simplified layouts. Follow the button labels in your actual admin screen; no sample records were added to your system.')
finish()

#2
page('Organize your Categories','Create reusable labels first, then select them when adding or editing menu items.','02 / Categories')
panel('Categories',180,255)
button(416,223,'Add category',119); dot(404,235,1)
text(55,261,'Category Options',11,True); rule(54,285,486)
text(63,297,'Name',9,True,MUTED); text(420,297,'Actions',9,True,MUTED)
text(63,328,'Chicken',11); button(400,323,'Edit',55,False); button(465,323,'Delete',67,False); dot(388,336,2)
rule(54,362,486)
text(63,377,'Add / edit dialog',9,True,OLIVE); text(63,400,'Category Name: Chicken',10); text(321,400,'Cancel  |  Add category / Save changes',9)
y=456
y=step(1,'Create a label','Click <b>Add category</b>. Enter a Category Name, such as <b>Chicken</b>, then click <b>Add category</b> in the dialog. Wait for the success message.',y)
y=step(2,'Edit a label','Click the pencil icon in the category row. Change Category Name and click <b>Save changes</b>. The label is available in menu item forms.',y)
y=step(3,'Delete a label','Click the trash icon. Check the category name in the alert dialog. Choose <b>Delete</b> to remove it, or <b>Cancel</b> to keep it.',y)
note('Existing menu items need a separate check','Renaming or deleting a category does not automatically relabel existing items. Open affected items, select the correct category, and save them.')
finish()

#3
page('Add a Main Dish','Use one example to learn the shared menu-item workflow.','03 / Main Dishes - create')
panel('Main dishes > Add Item > Create Item',180,318)
field(56,224,'Name *','Chicken Adobo',230); field(307,224,'Price *','PHP 120',230)
field(56,280,'Category','Chicken',147); field(221,280,'Sort','1',95)
text(351,280,'Active',8,True,MUTED); switch(351,303); text(390,304,'On',9)
field(56,337,'Description *','Chicken simmered in soy sauce, vinegar, garlic, and bay leaves.',481,42)
field(56,407,'Image Alt Text','Chicken adobo served in a bowl',230); field(307,407,'Image','Choose file',230)
button(321,463,'Cancel',85,False); button(421,463,'Create Item',116); dot(407,475,3)
y=516
y=step(1,'Open the form','Choose <b>Main dishes</b> in Menu catalog, then click <b>Add Item</b>. On a narrow screen, use the three-dot page actions menu.',y)
y=step(2,'Enter the dish details','Fill Name, Price, and Description. Select a Category (optional). Set Sort: lower numbers come first. Keep Active on to show the item; switch it off to hide it.',y)
y=step(3,'Choose an image and create','Upload one image, 5 MB or smaller, and write descriptive Image Alt Text. Click <b>Create Item</b>. Confirm the success message and find the new row.',y)
note('Sample values only','Use the actual dish name and approved selling price. Image upload is optional; without one, a new item uses the section image. A dedicated dish photo is recommended.')
finish()

#4
page('Edit, hide, or delete dishes','The same controls are used across menu catalog and featured-menu sections.','04 / Main Dishes - maintain')
panel('Main dishes - find the correct item first',180,237)
field(56,223,'Search menu items','Chicken Adobo',250); field(326,223,'Status','All items',210)
rule(55,282,482); text(58,294,'Name',9,True,MUTED);text(289,294,'Status',9,True,MUTED);text(422,294,'Actions',9,True,MUTED)
text(58,323,'Chicken Adobo',11,True); chip(287,321,'Active');button(391,318,'Edit',59,False);button(459,318,'Delete',77,False)
dot(378,330,1);dot(541,330,2)
text(58,378,'Alert: Delete Chicken Adobo?',10,True);button(344,372,'Cancel',82,False);button(440,372,'Delete',95)
y=437
y=step(1,'Edit or temporarily hide an item','Search for the dish, then click its pencil icon. Update the fields and choose <b>Save Item</b>. To hide a dish without deleting it, turn <b>Active</b> off and save.',y)
y=step(2,'Delete only when the item is no longer needed','Click the trash icon and check the item name in the confirmation alert. Click <b>Delete</b> to permanently remove it, or <b>Cancel</b>. There is no undo control.',y)
y=step(3,'Edit the section banner with Page Content','Open <b>Page Content</b> to change the heading, description, button label/link, badge, or hero image. Choose <b>Save Page</b>. This edits the section presentation, not an item.',y)
note('Reuse this workflow','Apply these steps to Student meals, Bilao trays, Add-ons, Drinks, Meal of the day, Best sellers, and Promotions. Choose the correct section before editing.')
finish()

#5
page('Find and scan a loyalty card','Only logged-in administrators can access scanning and manage stamps or rewards.','05 / Loyalty - find a member')
panel('Loyalty program > Scan Loyalty QR',180,264)
box(56,226,299,155,'#2D342F',r=8)
c.setStrokeColor(HexColor('#FCF7EE')); c.setLineWidth(2); c.rect(153,H-246-95,105,95,stroke=1,fill=0)
text(139,350,'Hold the QR card steady',9,False,'#FFFFFF')
button(377,240,'Open camera',151); dot(367,251,1)
para(377,285,'Allow camera access when the browser asks.',149,10,MUTED)
field(56,393,'Member code or QR link','BD-123ABC',295);button(372,408,'Open loyalty card',163)
dot(363,420,2)
y=465
y=step(1,'Scan with the camera','Open <b>Loyalty program</b>, click <b>Open camera</b>, and allow camera access. Point the camera at a customer\'s loyalty QR card. A recognized card opens its stamp screen automatically.',y)
y=step(2,'Use manual entry when needed','If scanning is unavailable, type the member code or paste the loyalty QR link into <b>Member code or QR link</b>. Click <b>Open loyalty card</b>.',y)
y=step(3,'Or find a registered member','In <b>Loyalty Registrations</b>, search by name, member code, or phone. Click <b>Open card</b> and confirm the member\'s identity before adding a stamp.',y)
note('Troubleshooting','If camera access fails, check browser permission or use manual entry. If your session expires, sign in again. No separate admin PIN is required.')
finish()

#6
page('Add stamps and redeem rewards','A completed 10-stamp card resets automatically; earned rewards remain available.','06 / Loyalty - manage a card')
panel('Loyalty card - sample member',180,268)
text(57,226,'Sample Customer',14,True);text(57,250,'BD-123ABC  |  Card 1',9,False,MUTED);text(444,228,'9 / 10',22,True,OLIVE)
for i in range(10):
    xx=57+i*48;box(xx,280,39,39,GOLD if i<9 else 'white',BORDER,9);text(xx+13,290,str(i+1),12,True,OLIVE if i<9 else RED)
button(57,341,'Add stamp',124);dot(190,354,1);button(307,341,'Redeem reward',166,False);dot(483,354,2)
text(58,398,'Dialog: optional Receipt or note, then confirm the action.',10)
y=468
y=step(1,'Add the next stamp','Check the customer name and card progress. Click <b>Add stamp</b> (or the next available slot). Enter an optional receipt/note and click <b>Add stamp</b> in the dialog. Wait for success before repeating.',y)
y=step(2,'Understand the automatic reset','After stamp 10, the current card advances to a new cycle with 0/10 stamps. The completed card earns a pending reward. Staff may continue stamping while that reward waits to be redeemed.',y)
y=step(3,'Redeem an earned reward','When a reward is ready, click <b>Redeem reward</b>, add an optional note, and confirm in the dialog. The oldest pending reward is redeemed first. Check the success message and updated reward count.',y)
note('If the card has changed','If you see a changed-card or already-added message, refresh the card before retrying. Never add another stamp just because a response is slow. No PIN is needed.')
finish()

#7
page('Moderate customer reviews','Choose which submissions appear on the public website.','07 / Reviews')
panel('Customer reviews > Review submission',180,264)
for x,s,on in [(55,'all',False),(125,'draft',True),(202,'approved',False),(303,'rejected',False)]: chip(x,227,s,90 if len(s)>5 else 59,on)
box(56,264,481,69,CREAM,r=6);text(69,275,'Sample Customer',11,True);text(69,302,'"The meal was freshly prepared and delicious."',10)
field(56,349,'Publication status','Approved - visible on website',285)
button(368,365,'Save changes',169);dot(354,378,2)
y=467
y=step(1,'Find and inspect a submission','Open <b>Reviews</b>. The draft filter shows reviews awaiting moderation. Use all, approved, or rejected to find other submissions. Read the rating, comment, and any attached images.',y)
y=step(2,'Set the publication status','Click <b>Review</b>. Choose <b>Approved</b> to publish, <b>Draft</b> to keep it pending and hidden, or <b>Rejected</b> to keep it hidden. Click <b>Save changes</b>. This dialog changes status, not the customer\'s words.',y)
y=step(3,'Remove a review if necessary','Click <b>Delete</b> on the review. Read the confirmation alert and choose Delete or Cancel. Deletion permanently removes the review.',y)
note('A review may disappear from the current filter','Approving a draft moves it out of the draft list. Select approved or all to find it again, then check the public website if needed.')
finish()

#8
page('Choose visible header links','Control the menu links shown to guests in the website header.','08 / Header navigation')
panel('Header navigation > Customer-facing links',180,256)
for i,(label,on) in enumerate([('Student Meals',True),('Promotions',False),('Meal of the Day',True),('Drinks',True)]):
    yy=225+i*48;text(58,yy,label,11,True);text(58,yy+18,'Visible in the public header' if on else 'Hidden from the public header',9,False,MUTED);switch(491,yy+5,on)
    if i<3:rule(57,yy+40,480)
dot(533,281,2)
y=458
y=step(1,'Open the settings page','Under Website settings, choose <b>Header navigation</b>. Locate the section whose header link you want to show or hide.',y)
y=step(2,'Change the switch','Turn the switch on to show the link, or off to hide it. The change saves immediately; there is no separate Save button. Wait for the operation to finish.',y)
y=step(3,'Check the guest-facing result','Use <b>View website</b> and inspect the header. Refresh the public page if needed. Use <b>Refresh</b> in management to reload the saved switch states.',y)
note('Hiding a link does not delete a section','These switches control header links only. They do not delete menu items, change their Active status, or block access through a direct page URL.')
finish()

#9
page('Create approved chatbot answers','Write the exact restaurant information the chatbot is allowed to share.','09 / Chatbot knowledge - create')
panel('Chatbot knowledge > Add Q and A',180,318)
field(56,225,'Question','How can I contact you about a concern?',481)
field(56,281,'Approved answer','For concerns, email barquillarenalyn@gmail.com or call 09929450802.',481,47)
field(56,354,'Category','Concerns',230);field(307,354,'Retrieval keywords','concern feedback contact help',230)
switch(57,414);text(96,414,'Active for chatbot answers',9);switch(319,414,False);text(358,414,'Suggested question',9)
button(383,457,'Create answer',154);dot(370,469,3)
y=515
y=step(1,'Open Add Q and A','Choose <b>Chatbot knowledge</b> under Website settings and click <b>Add Q and A</b>. Search first to avoid creating a duplicate question.',y)
y=step(2,'Write and classify the answer','Enter Question, Approved answer, Category, and useful Retrieval keywords. Use clear, verified facts. The chatbot Category is a topic label, separate from menu Categories.',y)
y=step(3,'Set availability and save','Enable <b>Active for chatbot answers</b> to make the entry usable. Optionally enable <b>Show as a suggested question</b>. Click <b>Create answer</b> and confirm the success message.',y)
note('Reuse existing information where possible','The concern contact above is a sample based on the configured contact details. If that question already exists, edit it instead of creating a second copy.')
finish()

#10
page('Keep chatbot knowledge current','Review saved answers when menus, contact details, or restaurant policies change.','10 / Chatbot knowledge - maintain')
panel('Approved answers - row actions',180,217)
text(57,229,'How can I contact you about a concern?',12,True);chip(57,258,'Active',68)
button(182,255,'Hide / Show',112,False);button(309,255,'Edit',85,False);button(409,255,'Delete',112,False)
dot(298,267,1);dot(531,267,2)
rule(55,300,482);button(57,323,'Sync Menu Data',159,False);text(236,330,'Refreshes generated menu answers',10,False,MUTED);dot(226,335,3)
y=418
y=step(1,'Edit or temporarily hide an answer','Use Search knowledge to find an entry. Click the pencil icon, update the fields, and choose <b>Save changes</b>. The eye icon toggles Show answer / Hide answer without deleting the entry.',y)
y=step(2,'Delete an obsolete answer','Click the trash icon and confirm <b>Delete</b> in the alert dialog. Hidden entries remain saved; deleted entries are permanently removed.',y)
y=step(3,'Refresh menu-based knowledge','Menu edits automatically attempt to refresh generated menu answers. Use <b>Sync Menu Data</b> if they appear outdated, then check the success message. Generated menu answers may be replaced by synchronization.',y)
text(38,665,'BEFORE YOU SIGN OUT',9,True,OLIVE)
para(38,685,'Confirm saves succeeded. Check the public menu or chatbot where relevant. Close any open dialogs, stop an active camera, then open your account menu and choose <b>Sign out</b>.',519,10.5,MUTED)
finish()
c.save()
print(OUT/'bindays-diner-admin-user-manual.pdf')
print(f'Created {PAGE} illustrated pages')
