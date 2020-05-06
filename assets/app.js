function round_down(number, precision) {
  return Math.floor(number * Math.pow(10, precision)) / Math.pow(10, precision);
}

function round_up(number, precision) {
  return Math.ceil(number * Math.pow(10, precision)) / Math.pow(10, precision);
}

function collect_dom() {
  input = {};
  output = {};
  $('.js').each(function (i, o) {
    o = $(o);
    var id = o.attr('id');
    var type = o.attr('type') || o.prop('tagName').toLowerCase();
    if (type == 'select' || type == 'number' || type == 'checkbox') {
      input[id] = o;
    } else {
      output[id] = o;
    }
  });
}

function reset_data() {
  Object.keys(data).forEach(function (id) {
    data[id] = 0;
  });
}

function collect_input_data(o) {
  var form = {};
  if (o) {
    form[$(o).attr('id')] = $(o);
  } else {
    form = input;
  }
  Object.keys(form).forEach(function (id) {
    var o = form[id];
    var type = o.attr('type') || o.prop('tagName').toLowerCase();
    if (type == 'select') {
      data[id] = (isNaN(o.val()) ? o.val() : parseInt(o.val())) || null;
    } else if (type == 'number') {
      data[id] = parseInt(Math.min(Math.max(o.val(), o.attr('min')), o.attr('max')) || (o.attr('min') > 0 ? o.attr('min') : 0)) || null;
      o.val(data[id]);
    } else if (type =='checkbox') {
      data[id] = o.prop('checked') ? 1 : null;
    }
  });
}

function collect_hash_data() {
  if (window.history) {
    var hash_string = table.hash_data.map(function (id) {
      return typeof(data[id]) == 'number' ? Base64.encode(data[id]) : data[id];
    }).join('.');
    window.history.replaceState(undefined, undefined, '#' + hash_string);
  }
}

function update() {
  update_job_data();
  update_target_data();
  update_target_effect_data();
  update_equipped_data();
  update_status_point_data();
  update_adopted_or_rebirth_data();
  update_passive_status_data();
  update_job_bonus_data();
  update_equipped_bonus_data();
  update_self_skill_bonus_data();
  update_misc_skill_bonus_data();
  update_buff_skill_bonus_data();
  update_item_bonus_data();
  update_extra_bonus_data();
  update_attack_skill_data();
  update_ignore_def_mdef_data();
  update_status_information_data();
  update_damage_data();
  update_output();
}

function update_job_data() {
  data.job = table.job[data.job];
}

function update_target_data() {
  data.target = Object.assign({}, table.monster['id_' + data.target]);
  data.target_size = table.label[data.target.size];
  data.target_race = table.label[data.target.race];
  data.target_element = table.label[data.target.element] + ' ' + data.target.element_lv;
  if (data.target.id > 1000) {
    data.target_hp = data.target.hp;
    data.target_soft_def = data.target.soft_def;
    data.target_def = data.target.def;
    data.target_soft_mdef = data.target.soft_mdef;
    data.target_mdef = data.target.mdef;
    data.target_hit = data.target.hit;
    data.target_flee = data.target.flee;
  } else {
    data.target.soft_def = data.player_soft_def;
    data.target.def = data.player_def;
    data.target.soft_mdef = data.player_soft_mdef;
    data.target.mdef = data.player_mdef;
    data.target.vit = data.player_vit;
  }
  data.attack_skill = table.attack_skill[data.attack_skill];
}

function update_target_effect_data() {
  Object.values(table.target_effect).forEach(function (target_effect) {
    if (data['target_effect_' + target_effect.id] > 0) {
      apply_effect(target_effect);
    }
  });
  if (data.target_frozen || data.target_stone) {
    data.target.def = value_rate2(data.target.def, 50);
    data.target.mdef = value_rate2(data.target.mdef, 125);
    data.target.element_lv = 1;
    if (data.target_frozen) {
      data.target.element = ele_water;
    } else {
      data.target.element = ele_earth;
    }
  }
}

function update_status_point_data() {
  var points = table.point_rewards[data.base_lv];
  if (data.job.rebirth) {
    points += table.point_reward_rebirth;
  }
  var point_consumptions = 0;
  'str agi vit int dex luk'.split(' ').forEach(function (o) {
    data[o + '_point_consumption'] = 2 + Math.floor((data[o] - 1) / 10);
    point_consumptions += table.point_consumptions[data[o]];
  });
  data.status_point = points - point_consumptions;
}

function update_adopted_or_rebirth_data() {
  if (data.job.rebirth) {
    data.bonus_base_hp_sp_mul = 25;
  } else if (data.adopted) {
    data.bonus_base_hp_sp_mul = -30;
    data.bonus_weight -= 1200;
  }
}

function update_passive_status_data() {
  data.passive_str = data.str;
  data.passive_agi = data.agi;
  data.passive_vit = data.vit;
  data.passive_int = data.int;
  data.passive_dex = data.dex;
  data.passive_luk = data.luk;
}

function update_job_bonus_data() {
  var job_bonus = table.job_bonus[data.job.id];
  job_bonus.forEach(function (job_bonus) {
    var job_lv_required = job_bonus[0];
    if (data.job_lv >= job_lv_required) {
      var job_bonus_status = job_bonus[1];
      data[job_bonus_status] += 1;
      data[job_bonus_status.replace('bonus', 'passive')] += 1;
    }
  });
}

function update_equipped_data() {
  Object.keys(table.equip_type).forEach(function (equip_type) {
    if (data[equip_type]) {
      var table_key = table.equip_type[equip_type].key;
      data[equip_type] = table[table_key]['id_' + data[equip_type]];
    }
  });
  data.equipped_ranged_weapon = data.equip_right && [item_bow, item_instrument, item_whip, item_pistol, item_rifle, item_gatling_gun, item_shotgun, item_grenade_launcher].includes(data.equip_right.type);
  data.equipped_ammunition_weapon = data.equip_right && [item_bow, item_pistol, item_rifle, item_gatling_gun, item_shotgun, item_grenade_launcher].includes(data.equip_right.type);

  if ((data.equip_right && data.equip_right.type == item_grenade_launcher && data.equip_ammunition && !data.equip_ammunition.name.includes('Sphere')) ||
      (data.equip_right && [item_pistol, item_rifle, item_gatling_gun, item_shotgun].includes(data.equip_right.type) && data.equip_ammunition && data.equip_ammunition.name.includes('Sphere'))) {
    data.equip_ammunition = null;
  }
}

function update_self_skill_bonus_data() {
  data.job.skills.forEach(function (skill_id) {
    var skill = table.self_skill[skill_id];
    if (data[skill_id] > 0) {
      apply_effect(skill, data[skill_id]);
    }
  });
}

function update_misc_skill_bonus_data() {
  Object.values(table.misc_skill).forEach(function (skill) {
    if (data[skill.id] > 0) {
      apply_effect(skill, data[skill.id]);
    }
  });
}

function update_buff_skill_bonus_data() {
  Object.values(table.buff_skill).forEach(function (skill) {
    if (data[skill.id] > 0) {
      apply_effect(skill, data[skill.id]);
    }
  });
}

function update_equipped_bonus_data() {
  var equipped_ids = [];
  Object.keys(table.equip_type).forEach(function (equip_type) {
    if (data[equip_type]) {
      if (!equipped_ids.includes(data[equip_type].id)) {
        equipped_ids.push(data[equip_type].id);
      }
      // add helpful information for 'effect' callback
      data[equip_type].equip_type = equip_type;
      if (typeof data[equip_type + '_refine'] !== 'undefined') {
        data[equip_type].refine = data[equip_type + '_refine'] || 0;
        if (!['equip_right', 'equip_left_dual'].includes(equip_type)) {
          data.bonus_def += table.armor_refine_bonus[data[equip_type].refine];
        }
      }
      if (data[equip_type].def) {
        data.bonus_def += data[equip_type].def;
      }
      if (data[equip_type].mdef) {
        data.bonus_mdef += data[equip_type].mdef;
      }
      var previous_bonus_str = data.bonus_str + data.bonus_all_stats;
      var previous_bonus_agi = data.bonus_agi + data.bonus_all_stats;
      var previous_bonus_vit = data.bonus_vit + data.bonus_all_stats;
      var previous_bonus_int = data.bonus_int + data.bonus_all_stats;
      var previous_bonus_dex = data.bonus_dex + data.bonus_all_stats;
      var previous_bonus_luk = data.bonus_luk + data.bonus_all_stats;
      apply_effect(data[equip_type], data[equip_type.replace(/_card\d/, '') + '_refine'] || 0);
      if (!equip_type.match(/card/) && !table.equip_no_passive_bonus.includes(data[equip_type].id)) {
        data.passive_str += data.bonus_str + data.bonus_all_stats - previous_bonus_str;
        data.passive_agi += data.bonus_agi + data.bonus_all_stats - previous_bonus_agi;
        data.passive_vit += data.bonus_vit + data.bonus_all_stats - previous_bonus_vit;
        data.passive_int += data.bonus_int + data.bonus_all_stats - previous_bonus_int;
        data.passive_dex += data.bonus_dex + data.bonus_all_stats - previous_bonus_dex;
        data.passive_luk += data.bonus_luk + data.bonus_all_stats - previous_bonus_luk;
        data.bonus_hp += data.bonus_vit + data.bonus_all_stats - previous_bonus_vit;
        data.bonus_sp += data.bonus_int + data.bonus_all_stats - previous_bonus_int;
      }
    }
  });
  table.item_combo.forEach(function (item_combo) {
    var matches = array_intersect(equipped_ids, item_combo.ids);
    if (matches.length == item_combo.ids.length) {
      apply_effect(item_combo);
    }
  });
}

function update_item_bonus_data() {
  var items_effect = {};
  Object.values(table.item).forEach(function (item) {
    if (data['item_' + item.id] > 0) {
      apply_item_effect(items_effect, item);
    }
  });
  Object.keys(items_effect).forEach(function (bonus) {
    data[bonus.replace('bonus_item', 'bonus')] += items_effect[bonus];
});
}

function update_extra_bonus_data() {
  Object.values(table.extra).forEach(function (item) {
    apply_effect(item, data['extra_' + item.id]);
  });
}

function apply_effect(instance, args) {
  if (instance.effect) {
    if (typeof(instance.effect) == 'object') {
      Object.keys(instance.effect).forEach(function (bonus) {
        if (bonus == 'bonus_weapon_ele') {
          // bonus_weapon_ele_right, bonus_weapon_ele_left_dual, bonus_weapon_ele_ammunition, bonus_weapon_ele_element
          data[bonus + '_' + instance.equip_type.replace('equip_', '')] = instance.effect[bonus];
        } else if (bonus.match(/ign_def|over_def|no_weapon_size_penalty/)) {
          // bonus_ign_def_xxx, bonus_over_def, no_weapon_size_penalty_xxx
          data[bonus] = instance.effect[bonus];
        } else {
          data[bonus] += instance.effect[bonus];
        }
      });
    } else if (typeof(instance.effect) == 'function') {
      instance.effect.call(instance, args);
    }
  }
}

function apply_item_effect(source, instance) {
  if (instance.effect) {
    if (typeof(instance.effect) == 'object') {
      Object.keys(instance.effect).forEach(function (bonus) {
        if (bonus.match(/bonus_item/)) {
          if ((source[bonus] || 0) < instance.effect[bonus]) {
            source[bonus] = instance.effect[bonus];
          }
        } else {
          data[bonus] += instance.effect[bonus];
        }
      });
    } else if (typeof(instance.effect) == 'function') {
      instance.effect();
    }
  }
}

function update_status_information_data() {
  data.total_str = data.str + data.bonus_str + data.bonus_all_stats;
  data.total_agi = data.agi + data.bonus_agi + data.bonus_all_stats;
  data.total_vit = data.vit + data.bonus_vit + data.bonus_all_stats;
  data.total_int = data.int + data.bonus_int + data.bonus_all_stats;
  data.total_dex = data.dex + data.bonus_dex + data.bonus_all_stats;
  data.total_luk = data.luk + data.bonus_luk + data.bonus_all_stats;

  // readjust bonus for display
  data.bonus_str = data.total_str - data.str;
  data.bonus_agi = data.total_agi - data.agi;
  data.bonus_vit = data.total_vit - data.vit;
  data.bonus_int = data.total_int - data.int;
  data.bonus_dex = data.total_dex - data.dex;
  data.bonus_luk = data.total_luk - data.luk;

  var base_hp = table.base_hp[data.job.base_job][data.base_lv - 1];
  data.hp = Math.floor(base_hp * (100 + data.bonus_base_hp_sp_mul) / 100);
  data.hp = Math.floor(data.hp * (100 + data.total_vit) / 100);
  data.hp += data.bonus_hp;
  data.hp = Math.floor(data.hp * (100 + data.bonus_hp_mul) / 100 * (100 + data.bonus_hp_final_mul) / 100);
  var base_sp = ['tk', 'sg', 'sl', 'gs', 'nj'].includes(data.job.base_job) ? table.base_sp[data.job.base_job][data.base_lv - 1] : Math.floor(10 + table.sp_mod[data.job.base_job] * data.base_lv);
  data.sp = Math.floor(base_sp * (100 + data.bonus_base_hp_sp_mul) / 100);
  data.sp = Math.floor(data.sp * (100 + data.total_int) / 100);
  data.sp += data.bonus_sp;
  data.sp = Math.floor(data.sp * (100 + data.bonus_sp_mul) / 100);
  data.hp_recovery = Math.max(1, Math.floor(data.hp / 200)) + Math.floor(data.total_vit / 5);
  data.hp_recovery = Math.floor(data.hp_recovery * (100 + data.bonus_hp_reg) / 100);
  data.sp_recovery = 1 + Math.floor(data.sp / 100) + Math.floor(data.total_int / 6);
  data.sp_recovery = Math.floor(data.sp_recovery * (100 + data.bonus_sp_reg) / 100);
  if (data.total_int >= 120) {
    data.sp_recovery += 4 + Math.floor(data.total_int / 2 - 60);
  }
  data.weight = 30 * data.str + table.base_weight[data.job.base_job] + data.bonus_weight;
  data.soft_atk = (data.total_luk / 3) + (data.base_lv / 4);
  if (data.equipped_ranged_weapon) {
    data.soft_atk += data.total_dex + (data.total_str / 5);
  } else {
    data.soft_atk += data.total_str + (data.total_dex / 5);
  }

  data.soft_atk = Math.floor(data.soft_atk);
  data.status_atk = data.soft_atk * 2;
  data.mastery_atk = data.bonus_mastery_atk;
  if (data.bonus_mastery_atk_from_str) {
    data.mastery_atk += data.total_str;
  }
  data.sevenwind_element = data.tk_sevenwind ? table.sevenwind_element[data.tk_sevenwind] : null;
  data.ammunition_element = data.equipped_ammunition_weapon ? data.bonus_weapon_ele_ammunition : null;
  data.right_weapon = new Weapon(data.equip_right, data.equipped_ranged_weapon);
  data.left_weapon = new Weapon(data.equip_left_dual);

  var weapon = data.right_weapon;
  var status_atk = data.status_atk;
  var status_atk_element = data.sevenwind_element || ele_neutral;
  var equip_atk = data.bonus_atk + (data.bonus_over_def ? 1 : 0) * Math.floor(data.target.def / 2);
  if (['as_lefthand', 'as_lefthand_crit'].includes(data.attack_skill.id) && data.equip_left_dual) {
    weapon = data.left_weapon;
    status_atk = data.soft_atk;
  }
  status_atk = value_rate2(status_atk, element_penalty_for(status_atk_element));
  data.atk = new Damage(weapon.min_atk, weapon.max_atk);
  data.atk.rate(weapon.size_penalty);
  data.atk.addition_rate(data.bonus_edp_weapon_atk);
  data.atk.add(value_addition_rate(equip_atk, data.bonus_edp_atk));
  if (data.sm_magnumbonus && !data.has_edp && !['has_meteorassault', 'hbs_carttermination', 'ham_aciddemonstration'].includes(data.attack_skill.id)) {
    var magnum_break_atk = new Damage(data.atk.min, data.atk.max);
    magnum_break_atk.rate(20);
    magnum_break_atk.rate2(element_penalty_for(ele_fire));
    data.atk.min += magnum_break_atk.min;
    data.atk.max += magnum_break_atk.max;
  }
  if (data.equipped_ammunition_weapon && data.equip_ammunition) {
    data.atk.add(data.equip_ammunition.atk);
  }
  data.atk.rate2(weapon.element_penalty);
  if (data.throwing_weapon_skill && data.equip_ammunition) {
    data.atk.add(data.equip_ammunition.atk);
  }
  data.atk.addition_rate(data['bonus_dmg_' + data.target.race] || 0);
  data.atk.addition_rate(data['bonus_dmg_' + data.target.element] || 0);
  data.atk.addition_rate(data['bonus_dmg_' + data.target.size] || 0);
  data.atk.addition_rate(data.bonus_dmg_monster);
  data.atk.addition_rate(data.bonus_atk_mul);
  data.atk.add(data.bonus_extra_atk);
  data.atk.addition_rate(data.bonus_adjust_atk_mul)
  data.atk.add(status_atk);
  data.atk.add(data.mastery_atk);
  data.atk.addition_rate(data.bonus_katar_atk);
  data.atk.adjust_min_max();
  data.min_atk = data.atk.min;
  data.max_atk = data.atk.max;
  weapon.display();

  data.soft_matk = data.total_int + Math.floor(data.total_int / 2) + Math.floor(data.total_dex / 5) + Math.floor(data.total_luk / 3) + Math.floor(data.base_lv / 4);
  data.matk = new Damage(data.right_weapon.min_matk, data.right_weapon.max_matk);
  if (data.equip_left_dual) {
    data.matk.min += data.left_weapon.min_matk;
    data.matk.max += data.left_weapon.max_matk;
  }
  data.matk.add(data.soft_matk);
  data.matk.addition_rate(data.bonus_matk_amp);
  data.weapon_matk = new Damage(data.matk.min, data.matk.max);
  data.matk.add(data.bonus_matk);
  data.matk.addition_rate(data.bonus_matk_mul);
  data.matk.addition_rate(data['bonus_matk_' + data.target.race] || 0);
  data.matk.addition_rate(data['bonus_matk_' + data.target.element] || 0);
  if (data.attack_skill.type == skill_matk) {
    data.matk.addition_rate(data['bonus_matk_skill_' + data.ele_matk] || 0);
  }
  data.matk.adjust_min_max();
  data.min_matk = data.matk.min;
  data.max_matk = data.matk.max;

  data.soft_def = Math.floor((data.total_vit / 2) + (data.base_lv / 2) + (data.total_agi / 5));
  data.hard_def = Math.floor(data.bonus_def * (100 + data.bonus_def_mul) / 100);
  data.soft_mdef = Math.floor(data.total_int + (data.total_vit / 5 ) + (data.total_dex / 5) + (data.base_lv / 4));
  data.hard_mdef = data.bonus_mdef;
  var job_base_aspd = table.job_base_aspd[data.job.base_job];
  if (data.equip_right) {
    job_base_aspd -= table.weapon_aspd_penalty[data.job.base_job][data.equip_right.type];
  }
  if (data.equip_left_dual) {
    job_base_aspd -= table.dual_weapon_aspd_penalty[data.job.base_job][data.equip_left_dual.type];
  }
  var agi = data.total_agi < 1 ? 1 : data.total_agi;
  var dex = data.total_dex < 1 ? 1 : data.total_dex;
  var shield_aspd_penalty = data.equip_left ? table.shield_aspd_penalty[data.job.base_job] : 0;
  if (data.equip_left_dual) {
    var aspd_correction = ([132, 141, 143].includes(job_base_aspd) ? 1 : 0.25) - 1 / 0.3655;
    var stat_aspd = Math.sqrt(agi * 2.904 + dex * 0.053);
    var aspd_penalty = 0.982466;
    var base_aspd = round_down(200 - (200 - (job_base_aspd + stat_aspd * aspd_penalty + stat_aspd * Math.pow(aspd_penalty, 2) + aspd_correction)) * (100 - data.bonus_aspd_mul) / 100, 2);
  } else {
    var aspd_correction = agi < 205 ? round_up((Math.sqrt(205) - Math.sqrt(agi)) / 7.15, 3) : 0;
    if (data.equip_right && data.equipped_ammunition_weapon) {
      var stat_aspd = Math.sqrt(agi * 9.91 + dex * 0.1919);
    } else {
      var stat_aspd = Math.sqrt(agi * 9.999 + dex * 0.19212);
    }
    var aspd_penalty = job_base_aspd > 145 ? 1 - (job_base_aspd - 144) / 50 : 0.96;
    var base_aspd = round_down(200 - (200 - (job_base_aspd - shield_aspd_penalty - aspd_correction + stat_aspd * aspd_penalty)) * (100 - data.bonus_aspd_mul) / 100, 2);
  }
  var bonus_aspd_equip = round_down((195 - base_aspd) * data.bonus_aspd_equip_mul / 100, 2);
  var aspd = base_aspd + bonus_aspd_equip + data.bonus_aspd;
  data.aspd = Math.min(190, round_down(aspd, 2)) + (aspd % 1 <= 0.011 ? '*' : null);
  data.hit = 175 + data.base_lv + data.total_dex + Math.floor(data.total_luk / 3) + data.bonus_hit;
  data.flee = 100 + data.base_lv + data.total_agi + Math.floor(data.total_luk / 5) + data.bonus_flee;
  data.perfect_dodge = 1 + Math.floor(data.total_luk / 10) + data.bonus_pdodge;
  data.critical = 1 + Math.floor(data.total_luk / 3) + data.bonus_crit + (data['bonus_crit_' + data.target.race] || 0);
}

function update_ignore_def_mdef_data() {
  data.bonus_ign_def = (data.bonus_over_def * 100) || (data.bonus_ign_def_nonboss && !table.monster_group.boss.includes(data.target.id) ? data.bonus_ign_def_nonboss : data['bonus_ign_def_' + data.target.race]) || 0;
  data.bonus_ign_def = Math.min(100, data.bonus_ign_def);
  data.bonus_ign_mdef += data['bonus_ign_def_rc_' + data.target.race] || 0;
  data.bonus_ign_mdef = Math.min(100, data.bonus_ign_mdef);
}

function update_attack_skill_data() {
  data.fake_hit_count = 1;
  data.true_hit_count = 1;
  if (data.attack_skill.effect) {
    data.attack_skill.effect(data.attack_skill_lv);
  }
}

function update_damage_data() {
  var dmg = null;
  if (data.dmg_rate > 0) {
    data.dmg_rate = value_addition_rate(data.dmg_rate + data.bonus_dmg_rate, data.bonus_dmg_rate_mul);
    if (data.attack_skill.type == skill_atk) {
      if (data.attack_skill.formula) {
        dmg = data.attack_skill.formula(data.attack_skill_lv);
      } else {
        dmg = data.atk;
      }
      if (data.dmg_range) {
        dmg.addition_rate(data.bonus_dmg_range);
      }
      dmg.rate(data.dmg_rate);
      if (data.flat_def) {
        dmg.sub(data.target.def);
      } else {
        var def = data.target.def - value_rate(data.target.def, data.bonus_ign_def);
        dmg.rate((4000 + def) / (4000 + def * 10) * 100);
      }
      if (data.dmg_critical) {
        dmg.addition_rate(data.bonus_dmg_crit);
      }
      dmg.add(data.bonus_dmg_pre_def);
      if (data.flat_def || data.bonus_ign_def < 100) {
        dmg.sub(data.target.soft_def);
      }

      dmg.add(data.bonus_dmg_final);
      if (data.dmg_critical) {
        dmg.addition_rate(40);
      }
      dmg.addition_rate(data.bonus_dmg_final_mul);
      if (data.throwing_weapon_skill) {
        dmg.rate2(element_penalty_for(data.bonus_weapon_ele_ammunition));
      }
    } else if (data.attack_skill.type == skill_atk_matk) {
      dmg = data.atk;
      dmg.min += data.min_matk;
      dmg.max += data.max_matk;
      dmg.rate(data.dmg_rate);
      dmg.sub(data.target.def + data.target.soft_def + data.target.mdef + data.target.soft_mdef);
      if (data.dmg_range) {
        dmg.addition_rate(data.bonus_dmg_range);
      }
      if (data.ele_matk) {
        dmg.rate2(element_penalty_for(data.ele_matk));
      }
    } else if (data.attack_skill.type == skill_matk) {
      var mdef = data.target.mdef - value_rate(data.target.mdef, data.bonus_ign_mdef);
      var dmg_element = data.ele_matk || ele_neutral;
      dmg = data.matk;
      dmg.rate(data.dmg_rate);
      dmg.rate((1000 + mdef) / (1000 + mdef * 10) * 100);
      dmg.sub(data.target.soft_mdef);
      dmg.rate2(element_penalty_for(dmg_element));
    } else {
      if (data.attack_skill.formula) {
        data.attack_skill.formula(data.attack_skill_lv);
      }
      var dmg_element = data.ele_matk || data.ele_atk || ele_neutral;
      dmg = new Damage(data.min_dmg, data.max_dmg);
      if (data.flat_def) {
        dmg.sub(data.target.def + data.target.soft_def);
      }
      if (data.flat_mdef) {
        dmg.sub(data.target.mdef + data.target.soft_mdef);
      }
      if (data.dmg_range) {
        dmg.addition_rate(data.bonus_dmg_range);
      }
      dmg.rate2(element_penalty_for(dmg_element));
    }
  }

  if (data.heal) {
    data.dmg = [dmg.min, dmg.max].join(' ~ ');
    data.attack_skill_type = 'Heal';
    $('#times_row').hide();
  } else if (dmg) {
    data.attack_skill_type = 'Damage';
    dmg.adjust_min_max();
    if (data.fake_hit_count > 1) {
      dmg.formula(function (dmg) { return Math.floor(dmg / data.fake_hit_count) * data.fake_hit_count });
    } else if (data.true_hit_count > 1) {
      dmg.rate(data.true_hit_count * 100);
    }
    data.dmg = [dmg.min, dmg.max].join(' ~ ');
    if (data.target.id > 1000) {
      var min_times = Math.ceil(data.target.hp / dmg.max);
      var max_times = Math.ceil(data.target.hp / dmg.min);
      min_times = min_times == Infinity ? '∞' : min_times;
      max_times = max_times == Infinity ? '∞' : max_times;
      data.times = [min_times, max_times].join(' ~ ');
      $('#times_row').show();
    } else {
      $('#times_row').hide();
    }
  } else {
    data.attack_skill_type = 'Damage';
    data.dmg = 'N/A';
    $('#times_row').hide();
  }
}

function update_output() {
  Object.keys(output).forEach(function (id) {
    output[id].text(data[id]);
  });
}

function load_hash_data() {
  if (window.location.hash) {
    window.location.hash.substr(1).split('.').forEach(function (value, i) {
      var o = input[table.hash_data[i]];
      if (i == 0) {
        o.val(value);
        if (!o.val()) {
          o.val('nv');
        }
        o.change();
      } else if (i == 3) {
        $('#adopted').prop('checked', value).change();
      } else if (value && i < table.hash_data.length) {
        o.val(Base64.decode(value));
      }
    });
    changed();
  } else {
    $('#job').change();
  }
}

function changed() {
  reset_data();
  collect_input_data();
  collect_hash_data();
  update();
}

function Weapon(weapon, ranged) {
  this.weapon = weapon;
  this.refine_lv = weapon ? weapon.refine : 0;
  this.refine_bonus = 0;
  this.over_refine_bonus = 0;
  this.base_atk = 0;
  this.stat_bonus = 0;
  this.atk_variance = 0;
  this.size_penalty = 100;
  this.element_penalty = 100;
  this.atk = 0;
  this.min_atk = 0;
  this.max_atk = 0;
  this.base_matk = 0;
  this.matk_variance = 0;
  this.matk = 0;
  this.min_matk = 0;
  this.max_matk = 0;
  this.ranged = ranged;
  if (this.weapon) {
    this.update_refine_bonus();
    this.update_atk();
    if (!this.ranged) {
      this.update_matk();
    }
  }
}

Weapon.prototype.update_refine_bonus = function () {
  var refine_bonus_table = table.weapon_refine_bonus[this.weapon.weapon_lv];
  this.refine_bonus = refine_bonus_table.raw[this.refine_lv];
  this.min_refine_bonus = this.ranged ? this.refine_bonus : refine_bonus_table.min[this.refine_lv];
  this.max_refine_bonus = this.ranged ? this.refine_bonus : refine_bonus_table.max[this.refine_lv];
}

Weapon.prototype.update_atk = function () {
  this.base_atk = this.weapon.atk;
  this.stat_bonus = this.base_atk * (data.equipped_ranged_weapon ? data.total_dex : data.total_str) / 200;
  this.atk_variance = this.base_atk * table.weapon_atk_variance[this.weapon.weapon_lv] / 100;
  if (table.weapon_size_penalty[this.weapon.type] && !data.bonus_no_weapon_size_penalty_all && !data['bonus_no_weapon_size_penalty_' + this.weapon.type + '_' + data.target.size]) {
    this.size_penalty = table.weapon_size_penalty[this.weapon.type][data.target.size];
  }
  var weapon_element = data.bonus_weapon_ele_element || data.sevenwind_element || data.ammunition_element || data.bonus_weapon_ele_right || ele_neutral;
  if (data.ele_atk) {
    weapon_element = data.ele_atk == ele_pseudo ? (data.target.element == ele_ghost ? ele_neutral : weapon_element) : data.ele_atk;
  }
  this.element_penalty = element_penalty_for(weapon_element);
  this.atk = this.base_atk + this.stat_bonus;
  this.min_atk = Math.floor(this.atk + this.min_refine_bonus - this.atk_variance * (data.dmg_critical || data.bs_maximize ? -1 : 1));
  this.max_atk = Math.floor(this.atk + this.max_refine_bonus + this.atk_variance);
}

Weapon.prototype.update_matk = function () {
  this.base_matk = this.weapon.matk;
  this.matk = this.base_matk;
  this.matk_variance = this.matk * table.weapon_matk_variance[this.weapon.weapon_lv] / 100;
  this.min_matk = Math.floor(this.matk + this.min_refine_bonus - this.matk_variance);
  this.max_matk = Math.floor(this.matk + this.max_refine_bonus + this.matk_variance);
}

Weapon.prototype.display = function () {
  data.weapon_refine_bonus = this.min_refine_bonus;
  data.max_weapon_refine_bonus = this.max_refine_bonus;
  data.base_weapon_atk = this.base_atk;
  data.weapon_stat_bonus = this.stat_bonus;
  data.weapon_atk_variance = this.atk_variance;
  data.weapon_size_penalty = this.size_penalty;
  data.weapon_element_penalty = this.element_penalty;
  data.hard_atk = this.base_atk + this.refine_bonus + data.bonus_atk;
  data.weapon_element_modifier = this.element_penalty;
  data.weapon_modifier = 100;
  data.weapon_modifier *= (100 + (data['bonus_dmg_' + data.target.race] || 0)) / 100;
  data.weapon_modifier *= (100 + (data['bonus_dmg_' + data.target.element] || 0)) / 100;
  data.weapon_modifier *= (100 + (data['bonus_dmg_' + data.target.size] || 0)) / 100;
  data.weapon_modifier *= (100 + (data.bonus_dmg_monster)) / 100;
  data.weapon_modifier *= (100 + data.bonus_atk_mul) / 100;
  data.weapon_modifier = Math.round(data.weapon_modifier * 100) / 100;
  data.hard_matk = this.base_matk + (this.ranged ? 0 : this.refine_bonus) + data.bonus_matk;
  if (data.equip_left_dual) {
    var weapon = data.left_weapon == this ? data.right_weapon : data.left_weapon;
    if (weapon) {
      data.hard_matk += weapon.base_matk + weapon.refine_bonus;
    }
  }
  data.matk_modifier = 100;
  data.matk_modifier *= (100 + data.bonus_matk_mul) / 100;
  data.matk_modifier *= (100 + (data['bonus_matk_' + data.target.race] || 0)) / 100;
  data.matk_modifier = Math.round(data.matk_modifier * 100) / 100;

}

function element_penalty_for(element) {
  return table.element_penalty[element][data.target.element][data.target.element_lv - 1]
}

function value_addition_rate(value, rate) {
  return value_rate(value, 100 + rate);
}

function value_rate(value, rate) {
  return Math.floor(value * rate / 100);
}

function value_rate2(value, rate) {
  if (rate >= 100) {
    return Math.floor(value * rate / 100);
  } else {
    return Math.ceil(value * rate / 100);
  }
}

function Damage(min, max) {
  this.min = min;
  this.max = max;
  this.element_penalty = 100;
}

Damage.prototype.addition_rate = function (rate) {
  this.min = value_addition_rate(this.min, rate);
  this.max = value_addition_rate(this.max, rate);
  return this;
}

Damage.prototype.rate = function (rate) {
  this.min = value_rate(this.min, rate);
  this.max = value_rate(this.max, rate);
  return this;
}

Damage.prototype.rate2 = function (rate) {
  this.min = value_rate2(this.min, rate);
  this.max = value_rate2(this.max, rate);
  return this;
}

Damage.prototype.add = function (value) {
  this.min += value;
  this.max += value;
  return this;
}

Damage.prototype.sub = function (value) {
  this.min -= value;
  this.max -= value;
  return this;
}

Damage.prototype.formula = function (callback) {
  this.min = callback(this.min);
  this.max = callback(this.max);
  return this;
}

Damage.prototype.adjust_min_max = function () {
  this.min = Math.max(0, this.min);
  this.max = Math.max(Math.max(0, this.max), this.min);
}

var renderer = {
  self_skill: function (job) {
    var html = '';
    if (job) {
      job.skills.forEach(function (skill_id) {
        var skill = table.self_skill[skill_id];
        html += '<div class="form-line"><select class="self-skill lv-picker form-control js" id="' + skill.id + '">' + renderer.skill_options(skill) + '</select> ' + skill.name + '</div>';
      });
    }
    return html;
  },
  misc_skill: function () {
    return Object.values(table.misc_skill).map(function (skill) {
      return '<div class="form-line"><select class="misc-skill lv-picker form-control js" id="' + skill.id + '">' + renderer.skill_options(skill) + '</select> ' + skill.name + '</div>';
    }).join('');
  },
  buff_skill: function () {
    return Object.values(table.buff_skill).map(function (skill) {
      return '<div class="form-line"><select class="buff-skill lv-picker form-control js" id="' + skill.id + '">' + renderer.skill_options(skill) + '</select> ' + skill.name + '</div>';
    }).join('');
  },
  item: function () {
    return Object.values(table.item).map(function (item) {
      var html = '<div class="form-line"><label><input type="checkbox" class="js" id="item_' + item.id + '"> ';
      if (item.title) {
        html += '<span data-toggle="tooltip" title="' + item.title + '"> ' + item.name + '</span>';
      } else {
        html += item.name;
      }
      html += '</div>';
      return html;
    }).join('');
  },
  extra: function () {
    return Object.values(table.extra).map(function (item) {
      var html = '<div class="form-line form-line-column"><input type="number" class="form-control js" min="-' + item.max + '" max="' + item.max + '" id="extra_' + item.id + '"> ';
      if (item.title) {
        html += '<span data-toggle="tooltip" title="' + item.title + '"> ' + item.name + '</span>';
      } else {
        html += item.name;
      }
      html += '</div>';
      return html;
    }).join('');
  },
  skill_options: function (skill) {
    var html = '';
    for (var i = skill.max_lv; i >= 0; i--) {
      if (i == 0) {
        html += '<option selected>' + i + '</option>';
      } else {
        html += '<option>' + i + '</option>';
      }
    }
    return html;
  },
  equip_options: function (job, equip_type) {
    var table_key = table.equip_type[equip_type].key;
    var html = '<option value="">(' + table.equip_type[equip_type].label + ')</option>';
    Object.keys(table[table_key]).forEach(function (id) {
      var item = table[table_key][id];
      if (typeof(item.jobs) == 'undefined' || ((item.jobs == 0 || (Math.pow(2, job.job_mask) & item.jobs)) && (item.classes == 0 || (Math.pow(2, job.class_mask) & item.classes)))) {
        html += '<option value="' + item.id + '">' + item.name + '</option>';
      }
    });
    return html;
  },
  equip_group_options: function (job, equip_type) {
    var table_key = table.equip_type[equip_type].key;
    var html = '<option value="">(' + table.equip_type[equip_type].label + ')</option>';
    groups = [];
    Object.keys(table[table_key]).forEach(function (id) {
      var item = table[table_key][id];
      if ((item.jobs == 0 || (Math.pow(2, job.job_mask) & item.jobs)) && (item.classes == 0 || (Math.pow(2, job.class_mask) & item.classes))) {
        var group = item.type + item.weapon_lv;
        if (!groups.includes(group)) {
          groups.push(group);
          html += '<optgroup label="' + table.item_type[item.type] + ' Lv ' + item.weapon_lv + '">';
        }
        html += '<option value="' + item.id + '">' + item.name + '</option>';
      }
    });
    return html;
  },
  monster_options: function () {
    return Object.values(table.monster)
    .map(function (monster) {
      return '<option value="' + monster.id + '">' + monster.name + '</option>';
    });
  },
  target_effect: function () {
    return Object.values(table.target_effect).map(function (target_effect) {
      var html = '<div class="form-line"><label><input type="checkbox" class="js" id="target_effect_' + target_effect.id + '"> ';
      if (target_effect.title) {
        html += '<span data-toggle="tooltip" title="' + target_effect.title + '"> ' + target_effect.name + '</span>';
      } else {
        html += target_effect.name;
      }
      html += '</div>';
      return html;
    }).join('');
  },
  attack_skill_options: function (job) {
    var html = '';
    if (job) {
      job.attack_skills.forEach(function (skill_id) {
        var skill = table.attack_skill[skill_id];
        html += '<option value="' + skill.id + '">' + skill.name + '</option>';
      });
    }
    return html;
  },
  attack_skill_lv_options: function (max_lv) {
    var html = '';
    for (var i = max_lv; i > 0; i--) {
      html += '<option>' + i + '</option>';
    }
    return html;
  }
};

$(function () {
  $(document)
  .on('change', '#job', function () {
    var job = table.job[this.value];
    var cannot_be_adopted = job.rebirth || job.job_mask > 20;
    $('#adopted').prop('disabled', cannot_be_adopted);
    if (cannot_be_adopted) {
      $('#adopted').prop('checked', false);
    }
    $('#self_skill').html(renderer.self_skill(job));
    $('#attack_skill').html(renderer.attack_skill_options(job));
    Object.keys(table.equip_type).forEach(function (equip_type) {
      var select = $('#' + equip_type);
      if (equip_type == 'equip_right' || equip_type == 'equip_left_dual') {
        select.html(renderer.equip_group_options(job, equip_type));
      } else {
        select.html(renderer.equip_options(job, equip_type));
      }
      if (!equip_type.match(/card|smith|pet/)) {
        select.closest('tr').toggle(select.children('option,optgroup').length > 1);
      }
    });
    $('#job_lv').prop('max', job.max_job_lv).val(job.max_job_lv);
    collect_dom();
  })
  .on('change', '#adopted', function () {
    var adopted = this.checked;
    $('input', '.status').each(function () {
      $(this).attr('max', adopted ? 80 : 99);
    });
  })
  .on('change', '#target_effect_frozen, #target_effect_stone', function () {
    var checked = this.checked;
    if (checked) {
      $('#target_effect_frozen, #target_effect_stone').not($(this)).prop('checked', false);
    }
  })
  .on('change', '#target', function () {
    var target = table.monster['id_' + this.value];
    var player = target.id == 1000;
    var cannot_be_frozen = (target.mdef || $('#player_mdef').val()) >= 100 || target.element == ele_undead || table.monster_group.boss.includes(target.id);
    $('#player_def_row').toggle(player);
    $('#player_mdef_row').toggle(player);
    $('#player_vit_row').toggle(player && data.attack_skill.id == 'ham_aciddemonstration');
    $('#player_error_notification').toggle(player && ['has_breaker', 'ham_aciddemonstration'].includes(data.attack_skill.id));
    $('#target_def_row').toggle(!player);
    $('#target_mdef_row').toggle(!player);
    $('#target_hp_row').toggle(!player);
    $('#target_hit_row').toggle(!player);
    $('#target_flee_row').toggle(!player);
    $('#target_effect_frozen, #target_effect_stone').prop('disabled', cannot_be_frozen);
    if (cannot_be_frozen) {
      $('#target_effect_frozen, #target_effect_stone').prop('checked', false);
    }
  })
  .on('change', '#player_mdef', function () {
    var cannot_be_frozen = this.value >= 100;
    $('#target_effect_frozen, #target_effect_stone').prop('disabled', cannot_be_frozen);
    if (cannot_be_frozen) {
      $('#target_effect_frozen, #target_effect_stone').prop('checked', false);
    }
  })
  .on('change', '#attack_skill', function () {
    var skill = table.attack_skill[this.value];
    var custom_max_lv = parseInt($(':selected', this).attr('data-max-lv'));
    var custom_lv = parseInt($(':selected', this).attr('data-lv'));
    $('#attack_skill_lv').html(renderer.attack_skill_lv_options(custom_max_lv || skill.max_lv)).val(custom_lv || custom_max_lv || skill.max_lv);
    $('#player_vit_row').toggle(data.target.id == 1000 && this.value == 'ham_aciddemonstration');
    $('#player_error_notification').toggle(data.target.id == 1000 && ['has_breaker', 'ham_aciddemonstration'].includes(this.value));
  })
  .on('change', '.equipment-select', function () {
    var id = this.value;
    if (id > 500) {
      $('#equip_detail').html('<a href="https://revodb.prtwiki.in.th/items/' + id + '" target="_blank">' + this.options[this.selectedIndex].innerText + '</a>');
    }
  })
  .on('change', '#target', function () {
    var id = this.value;
    if (id > 1000) {
      $('#target_detail').html('<a href="https://revodb.prtwiki.in.th/monsters/' + id + '" target="_blank">' + this.options[this.selectedIndex].innerText + '</a>');
    }
  })
  .on('change', 'select,input', changed)
  .on('mousedown', '.lv-picker', function (e) {
    if (e.button == 2) {
      var o = $(this);
      if (o.val() == 0) {
        o.val(o.children(':first').val());
      } else {
        o.val(0);
      }
      o.trigger('change');
    }
  })
  .on('contextmenu', '.lv-picker', function (e) {
    e.preventDefault();
  })
  .on('click', '[type="number"]', function () {
    $(this).select();
  })
  .on('click', '.toggle', function (e) {
    e.preventDefault();
    $($(this).attr('data-toggle')).toggle();
  });
  $(window).on('hashchange', load_hash_data);
  $('.toggle').click();
  $('#misc_skill').html(renderer.misc_skill());
  $('#buff_skill').html(renderer.buff_skill());
  $('#item_buff').html(renderer.item());
  $('#extra_buff').html(renderer.extra());
  $('[data-toggle="tooltip"]').tooltip();
  $('#target_effect').html(renderer.target_effect());
  $('#target').html(renderer.monster_options());
  $('#attack_skill_lv').html(renderer.attack_skill_lv_options(1));
  collect_dom();
  load_hash_data();
  if (ClipboardJS.isSupported()) {
    var clipboard_btn = $('#clipboard_btn');
    clipboard_btn
      .on('click', function () {
        clipboard_btn.tooltip('show');
      })
      .on('mouseleave', function () {
        clipboard_btn.tooltip('hide');
      })
      .show();
    new ClipboardJS('#clipboard_btn', {
      text: function(trigger) {
          return window.location.href;
      }
    });
  }
});
