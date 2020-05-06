var input = {};
var output = {};
var data = {};

// it breaks every coding practice but YOLO
var bonus = 'adjust_atk adjust_atk_mul agi all_stats aspd aspd_equip_mul aspd_mul atk atk_amp atk_mul base_hp_sp_mul crit crit_rc_brute crit_rc_demon crit_rc_demi_human crit_rc_dragon crit_rc_fish crit_rc_formless crit_rc_insect crit_rc_undead def def_mul dex dmg_monster dmg_crit dmg_ele_earth dmg_ele_fire dmg_ele_ghost dmg_ele_neutral dmg_ele_dark dmg_ele_undead dmg_ele_water dmg_ele_wind dmg_final dmg_final_mul dmg_pre_def dmg_range dmg_rate dmg_rate_mul dmg_rc_angel dmg_rc_brute dmg_rc_demi_human dmg_rc_demon dmg_rc_dragon dmg_rc_fish dmg_rc_formless dmg_rc_insect dmg_rc_plant dmg_rc_undead dmg_size_large dmg_size_medium dmg_size_small edp_atk edp_weapon_atk extra_atk flee heal_mul heal_rec_mul hit hp hp_final_mul hp_mul hp_reg ign_def_nonboss ign_def_rc_brute ign_def_rc_demi_human ign_def_rc_demon ign_def_rc_dragon ign_def_rc_plant ign_mdef ign_mdef_rc_demi_human int katar_atk luk mastery_atk matk matk_amp matk_ele_water matk_ele_earth matk_ele_fire matk_ele_wind matk_ele_poison matk_ele_holy matk_ele_dark matk_ele_ghost matk_ele_undead matk_skill_ele_earth matk_skill_ele_fire matk_skill_ele_holy matk_skill_ele_ghost matk_skill_ele_water matk_skill_ele_wind matk_mul matk_rc_angel matk_rc_brute matk_rc_demi_human matk_rc_demon matk_rc_dragon matk_rc_fish matk_rc_formless matk_rc_insect matk_rc_plant matk_rc_undead mdef over_def pdodge red_boss red_cast red_ele_earth red_ele_fire red_ele_ghost red_ele_holy red_ele_neutral red_ele_poison red_ele_dark red_ele_undead red_ele_water red_ele_wind red_non_boss red_range red_rc_angel red_rc_brute red_rc_demi_human red_rc_demon red_rc_dragon red_rc_fish red_rc_formless red_rc_insect red_rc_plant red_rc_undead red_size_large red_size_medium reflect_phy_dmg res_status_bleeding res_status_blind res_status_burning res_status_chaos res_status_cristallization res_status_curse res_status_freeze res_status_poison res_status_silence res_status_sleep res_status_stone res_status_stun sanc_mul sp sp_mul sp_reg str vit weight';
bonus.split(' ').forEach(function (o) {
  var name = 'bonus_' + o;
  window[name] = name;
  // also put on data
  data[name] = 0;
});

var size = 'small medium large';
size.split(' ').forEach(function (o) {
  var name = 'size_' + o;
  window[name] = name;
});

var race = 'formless undead brute plant insect fish demon demi_human angel dragon';
race.split(' ').forEach(function (o) {
  var name = 'rc_' + o;
  window[name] = name;
});

var element = 'neutral water earth fire wind poison holy dark ghost undead pseudo magic deadly_poison';
element.split(' ').forEach(function (o) {
  var name = 'ele_' + o;
  window[name] = name;
});

var item_type = 'headgear1 headgear2 headgear3 armor shield garment footgear accessory dagger 1h_sword 2h_sword 1h_spear 2h_spear 1h_axe 2h_axe mace 1h_staff 2h_staff bow claw instrument whip book katar pistol rifle gatling_gun shotgun grenade_launcher huuma card arrow';
item_type.split(' ').forEach(function (o) {
  var name = 'item_' + o;
  window[name] = name;
});

var attack_skill_type = 'atk matk atk_matk formula';
attack_skill_type.split(' ').forEach(function (o) {
  var name = 'skill_' + o;
  window[name] = name;
});

function add_bonus_dmg_rate_mul(skills, value) {
  if (skills.includes(data.attack_skill.id.split('_')[1])) {
    data.bonus_dmg_rate_mul += value;
  }
}

function equip_right_type_is() {
  return data.equip_right && Array.prototype.slice.call(arguments).includes(data.equip_right.type);
}

function add_attack_skill(skill_id, lv, max_lv) {
  max_lv = max_lv || lv;
  if (this.ids) {
    var id = 'attack_skill_' + this.ids.join('_') + '_' + skill_id;
    if ($('#' + id).length == 0) {
      var skill = table.attack_skill[skill_id];
      var combo_items = [];
      var ids = this.ids;
      Object.keys(table.equip_type).forEach(function (equip_type) {
        if (data[equip_type] && ids.includes(data[equip_type].id)) {
          combo_items.push(data[equip_type]);
        }
      });
      $('#attack_skill').append('<option id="' + id + '" value="' + skill_id + '" data-lv="' + lv + '" data-max-lv="' + max_lv + '">' + skill.name + ' (' + combo_items[0].name + ' Combo)</option>');
      combo_items.forEach(function (item) {
        $('#' + item.equip_type).one('change', function () {
          $('#' + id).remove();
        });
      });
    }
  } else {
    var id = 'attack_skill_' + this.equip_type + '_' + skill_id;
    if ($('#' + id).length == 0) {
      var skill = table.attack_skill[skill_id];
      $('#attack_skill').append('<option id="' + id + '" value="' + skill_id + '" data-lv="' + lv + '" data-max-lv="' + max_lv + '">' + skill.name + ' (' + this.name + ')</option>');
      $('#' + this.equip_type).one('change', function () {
        $('#' + id).remove();
      });
    }
  }
}
