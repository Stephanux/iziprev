/*
 * GET / POST inserter
 * Il s'agit ici d'un Bean générique qui en fonction des données dans
 * l'annuaire otf json est capable de faire un insert et d'insérer un
 * ou des objets json dans le model passé dans l'annuaire.
 */
var logger = require('log4js').getLogger('registreetape');
logger.setLevel(GLOBAL.config["LOGS"].level);
var mongoose = require('mongoose');
//var genericModel = require(__dirname + '/../../../ressources/models/mongooseGeneric');

exports.registreetape = {
registreEtape: function (req, cb) {
    var _controler = req.session.controler;
    var model = _controler.data_model;
    logger.debug('path    : ', _controler.path);
    logger.debug('room    : ', _controler.room);
    logger.debug('model   : ', _controler.data_model);
    logger.debug('params  : ', _controler.params);
    logger.debug('schema  : ', _controler.schema);
    var dataArray = _controler.params;
    var dataMiseajour = {};
    var dataIntoArray = [];
    var k = 0;
    // preparation des données reçues
    /** todo : Attention ici on doit parcourir les 24 lignes de saisie et pas seulement les fields du body */
    for (var field in dataArray) {
        if (!Array.isArray(dataArray[field])) {
            dataMiseajour[field] = dataArray[field];
        }
    }
    var nbFieldsToinsert = dataArray["libelle"].length;
    for (var k = 0; k < nbFieldsToinsert; k++) {
        /** todo : ici transformer le tableau pour avoir un tableau de data par collection */
        dataIntoArray.push({
            "libelle": dataArray["libelle"][k],
            "tel": dataArray["tel"][k],
            "adresse1": dataArray["adresse1"][k],
            "adresse2": dataArray["adresse2"][k],
            "code_postal": dataArray["code_postal"][k],
            "ville": dataArray["ville"][k]
        });
    }
    // insertion des données de la collection MiseAJour, entête du formulaire
    GLOBAL.schemas[model[0]].createDocument(dataMiseajour, function (err, data_inserted1) {
        var tabIds = [];
        logger.debug("objet inséré via inserter.registreEtape : ", data_inserted1);

        // fonction récursive pour insérer les numéro de téléphone des différentes organisation et catgorie
        function insertArray(j, cbk) {
            logger.debug(" List inserter call");
            var numeroModel = 0;
            //sio.sockets.in(_controler.room).emit('user', {room: _controler.room, comment: ' One User\n\t Your Filter is :'});
            try {
                if (j < 24) {
                    if (j < 14) {
                        numeroModel = 2;
                    }
                    else if (j > 13 && j < 20) {
                        numeroModel = 3;
                    }
                    else if (j > 19 && j < 24) {
                        numeroModel = 4;
                    }
                    GLOBAL.schemas[model[numeroModel]].createDocument(dataIntoArray[j], function (err, data_inserted) {
                        logger.debug("objet inséré via inserter.registreEtape : ", data_inserted);
                        /** todo : trouver une meilleurs façon de stoàcker les ids des ligne insérer denuméros de tél
                         * todo : pour les insérer des la collection NumeroUtiles                                     */
                        tabIds.push(data_inserted._id);
                        insertArray(j + 1, cbk);
                    });
                } else {
                    cbk();
                }
            } catch (err) { // si existe pas alors exception et on l'intègre via mongooseGeneric
                return cb(err);
            }
        }

        /** todo : il faut plusieurs appel recursif pour traiter l'ensemble des champs de chaque catégorie */
        insertArray(0, function () {
            logger.debug('documents insérés');
            /** todo ici on va gérer les ids des numéros de tél des différentes organisations our l'insérer dans NumeroUtile*/
            console.log('dataIntoArray : ', dataIntoArray);
            console.log('tabIds : ', tabIds);
            //return cb(null, {data: dataIntoArray, room: _controler.room});
            /** todo : ici on doit découper le tableau des ids précédemment insérés pour les ajouter à la collection NumeroUtiles */
                //préparation des données sous la forme de 3 tableaux d'_ids
            var dataToInsert = {
                    installateurs_extId: tabIds.slice(14, 20),
                    verificateursAgrees_extId: tabIds.slice(20),
                    numerosUrgence_extId: tabIds.slice(0, 14)
                }
            console.log('les numéros utiles a insérer : ', dataToInsert);
            GLOBAL.schemas[model[1]].createDocument(dataToInsert, function (err, data_inserted2) {
                logger.debug("data insérées : ", data_inserted2);

                return cb(null, {data: data_inserted2, room: _controler.room});
            });
        });
    });
},


registreEtape2: function (req, cb) {
    var _controler = req.session.controler;
    var model = _controler.data_model;
    logger.debug('path    : ', _controler.path);
    logger.debug('room    : ', _controler.room);
    logger.debug('model   : ', _controler.data_model);
    logger.debug('params  : ', _controler.params);
    logger.debug('schema  : ', _controler.schema);
    var dataArray = _controler.params;
    var dataTableau = {};
    var dataIntoArray = [];

    // preparation des données reçues
    /** todo : Attention ici on doit parcourir les lignes de saisie */
    for (var field in dataArray) {
        if (!Array.isArray(dataArray[field])) {
            dataTableau[field] = dataArray[field];
        }
    }
},

registreEffectif: function (req, cb) {
    var _controler = req.session.controler;
    var model = _controler.data_model;
    logger.debug('path    : ', _controler.path);
    logger.debug('room    : ', _controler.room);
    logger.debug('model   : ', _controler.data_model);
    logger.debug('params  : ', _controler.params);
    logger.debug('schema  : ', _controler.schema);
    var dataArray = _controler.params;
    var dataTableau = {};
    var dataIntoArray = [];

    // parcours du tableau
    for (var field in dataArray) {
        if (!Array.isArray(dataArray[field])) {
            dataTableau[field] = dataArray[field];
        }
    }
    //variable qui delimite le tableau par rapport au type de salarie
    var categorie = dataArray["categorie_salarie"].length;
    for (var k = 0; k < categorie; k++) {
        dataIntoArray.push({
            "categorie_salarie" : dataArray["categorie_salarie"][k],
            "nbre": dataArray["nbre"][k],
            "annee": dataArray["annee"][k],
        });
    }
    GLOBAL.schemas[model].createDocument(dataArray, function (err, data_inserted) {

        dataIntoArray.push(data_inserted._id);
        logger.debug("objet inséré via inserter.registreEtape : ", data_inserted);

        return cb(null, {data: data_inserted, room: _controler.room});
    });

},

    registreInstruction: function (req, cb) {
        var _controler = req.session.controler;
        var model = _controler.data_model;
        logger.debug('path    : ', _controler.path);
        logger.debug('room    : ', _controler.room);
        logger.debug('model   : ', _controler.data_model);
        logger.debug('params  : ', _controler.params);
        logger.debug('schema  : ', _controler.schema);
        var dataArray = _controler.params;
        var dataTableau = {};
        var dataIntoArray = [];

        // parcours du tableau
        for (var field in dataArray) {
            if (!Array.isArray(dataArray[field])) {
                dataTableau[field] = dataArray[field];
            }
        }
        //variable qui delimite le tableau par rapport au type de salarie
        var theme = dataArray["theme"].length;
        for (var k = 0; k < categorie; k++) {
            dataIntoArray.push({
                "date": dataArray["date"][k],
                "theme": dataArray["theme"][k],
                "observations": dataArray["observations"][k],
                "OrganismesFormations_extId": dataArray["OrganismesFormations_extId"][k],
                "visa": dataArray["visa"][k],
            });
        }
        GLOBAL.schemas[model].createDocument(dataTableau, function (err, data_inserted) {

            dataIntoArray.push(data_inserted._id);
            logger.debug("objet inséré via inserter.registreEtape : ", data_inserted);

            return cb(null, {data: data_inserted, room: _controler.room});
        });
    }
}
