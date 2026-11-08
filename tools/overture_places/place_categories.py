"""Visual classification only. Never excludes source records or uses confidence.

The first 15 groups derive from Overture Explorer's category styles (MIT).
See OVERTURE-EXPLORER-NOTICE.txt. Additional mappings and all artwork are local.
Classification runs once per record while building the local spatial index.
"""
import csv
from pathlib import Path

# Pinned 2026-10-21.0 hierarchy-derived mappings, checked into the installer.
# Kept separate so contributors can review every category and assigned icon.
with Path(__file__).with_name('basic_category_icons.csv').open(encoding='utf-8', newline='') as stream:
    BASIC_ICONS = {row['basic_category']: row['icon_group'] for row in csv.DictReader(stream)}

OVERTURE_GROUPS = {
    'airport': ['airport','domestic_airport','major_airport','ultralight_airport'],
    'bar': ['beach_bar','beer_bar','champagne_bar','cocktail_bar','dive_bar','drive_thru_bar','hotel_bar','pub','sake_bar','lounge','speakeasy','sports_bar','tiki_bar','vermouth_bar','whiskey_bar','wine_bar'],
    'education': ['college_university','architecture_schools','business_schools','engineering_schools','law_schools','medical_sciences_schools','dentistry_schools','pharmacy_schools','veterinary_schools','science_schools','educational_research_institute'],
    'convenience': ['convenience_store'],
    'fuel': ['gas_station','truck_gas_station'],
    'golf': ['golf_course','golf_club','indoor_golf_center'],
    'grocery': ['grocery_store','specialty_grocery_store','asian_grocery_store','ethical_grocery','indian_grocery_store','japanese_grocery_store','korean_grocery_store','kosher_grocery_store','mexican_grocery_store','organic_grocery_store','russian_grocery_store'],
    'health': ['childrens_hospital','hospital'],
    'lodging': ['hostel','hotel','inn','lodge','motel'],
    'parks': ['park','dog_park','memorial_park','national_park','state_park'],
    'parking': ['parking'],
    'rail': ['light_rail_and_subway_stations','metro_station','trains','train_station'],
    'restaurant': [], 'shop': [],
    'stadium': ['stadium_arena','baseball_stadium','basketball_stadium','cricket_ground','football_stadium','hockey_arena','rugby_stadium','soccer_stadium','tennis_stadium','track_stadium'],
}
ADDITIONAL = {
    'cafe': ['cafe','coffee_shop','coffee_house','tea_house','tea_room','coffee_and_tea'],
    'bakery': ['bakery','bakeries','pastry_shop','donut_shop','dessert_shop','ice_cream_shop'],
    'bank': ['bank','atm','credit_union','financial_services','banks_and_credit_unions'],
    'government': ['government','government_services','government_building','city_hall','courthouse','police_station','fire_station','post_office','embassy','public_services_and_government'],
    'worship': ['place_of_worship','religious_organization','church','mosque','synagogue','temple','religious_center'],
    'entertainment': ['cinema','movie_theater','theater','performing_arts','music_venue','night_club','arts_and_entertainment','art_gallery','bowling_alley','amusement_park'],
    'beauty': ['beauty_salon','hair_salon','barber','barber_shop','hairdressers','nail_salon','spa','beauty_and_spas'],
    'fitness': ['gym','fitness_center','yoga_studio','sports_club','sports_and_recreation','dance_studio','swimming_pool'],
    'automotive': ['auto_repair','car_repair','car_dealer','car_wash','automotive','automotive_services','auto_parts_store'],
    'office': ['office','business','business_services','professional_services','professional_service','lawyer','legal_services','accountant','accounting','insurance','insurance_agency','real_estate','real_estate_agency','consulting','advertising','marketing','organization','non_profit_organization'],
    'landmarks': ['landmark','historic_site','monument','memorial','museum','tourist_attraction','visitor_center'],
    'services': ['services','local_services','laundry','dry_cleaning','pet_services','veterinarian','repair_services'],
    'education': ['school','primary_school','secondary_school','university','college','kindergarten','library','education','preschool','day_care'],
    'health': ['health','health_and_medical','health_and_medicine','clinic','medical_center','pharmacy','dentist','doctor','medical_clinic','urgent_care','dental_clinic'],
    'parks': ['playground','garden','nature_reserve'],
    'grocery': ['supermarket','food_market','grocery'],
    'rail': ['bus_station','bus_stop','transportation','transit_station','ferry_terminal'],
    'shop': ['shopping','retail','retail_store','shopping_center','department_store','clothing_store','electronics_store','bookstore','furniture_store','florist','jewelry_store','hardware_store','gift_shop','pet_store'],
    'parking': ['parking_lot','parking_garage'],
    'restaurant': ['restaurants','food_and_restaurants','fast_food','food_truck','diner','pizzeria'],
}
EXACT = {category: group for groups in (OVERTURE_GROUPS,ADDITIONAL) for group,categories in groups.items() for category in categories}
# Tokens are complete underscore-separated words, avoiding bar -> barber errors.
TOKEN_GROUPS = (
    ('cafe',{'cafe','coffee','tea'}),('bakery',{'bakery','pastry','dessert','donut','icecream'}),
    ('restaurant',{'restaurant','restaurants','pizzeria'}),('beauty',{'salon','barber','spa'}),
    ('health',{'hospital','clinic','dental','dentist','pharmacy','medical'}),
    ('education',{'school','schools','university','college','library','education'}),
    ('bank',{'bank','banking','atm'}),('government',{'government','courthouse','police','firehouse','embassy'}),
    ('worship',{'church','mosque','synagogue','temple','religious'}),
    ('lodging',{'hotel','hostel','motel','lodging','accommodation'}),
    ('automotive',{'automotive','mechanic','dealership'}),('fitness',{'gym','fitness','yoga'}),
    ('entertainment',{'cinema','theater','theatre','entertainment'}),
    ('office',{'lawyer','attorney','accounting','insurance','consulting','professional'}),
    ('grocery',{'grocery','supermarket'}),('shop',{'shop','shopping','store','retail'}),
    ('parks',{'park','garden','playground'}),('bar',{'bar','pub'}),
)


def icon_group(category):
    if not isinstance(category,str) or not category.strip(): return 'other'
    normalized=category.strip().lower().replace(' ','_').replace('-','_')
    if normalized in BASIC_ICONS:return BASIC_ICONS[normalized]
    if normalized in EXACT:return EXACT[normalized]
    tokens=set(normalized.split('_'))
    for group,keywords in TOKEN_GROUPS:
        if tokens & keywords:return group
    return 'other'
