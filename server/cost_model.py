import numpy as np

# Expanded CGHS/NHA rate data for common procedures
MOCK_DATA = {
    # Orthopaedic
    "knee_replacement": {
        "base": 150000,
        "tier_mult": {1: 1.3, 2: 1.0, 3: 0.75},
        "type_mult": {"public": 0.4, "private": 1.2, "trust": 0.85}
    },
    "hip_replacement": {
        "base": 180000,
        "tier_mult": {1: 1.3, 2: 1.0, 3: 0.75},
        "type_mult": {"public": 0.4, "private": 1.2, "trust": 0.85}
    },
    "fracture_surgery": {
        "base": 60000,
        "tier_mult": {1: 1.2, 2: 1.0, 3: 0.8},
        "type_mult": {"public": 0.35, "private": 1.3, "trust": 0.9}
    },
    "spine_surgery": {
        "base": 200000,
        "tier_mult": {1: 1.4, 2: 1.0, 3: 0.8},
        "type_mult": {"public": 0.45, "private": 1.3, "trust": 0.9}
    },

    # Eye
    "cataract": {
        "base": 25000,
        "tier_mult": {1: 1.3, 2: 1.0, 3: 0.75},
        "type_mult": {"public": 0.25, "private": 1.5, "trust": 0.9}
    },
    "lasik": {
        "base": 45000,
        "tier_mult": {1: 1.4, 2: 1.0, 3: 0.75},
        "type_mult": {"public": 0.5, "private": 1.4, "trust": 0.9}
    },

    # General Surgery
    "appendectomy": {
        "base": 45000,
        "tier_mult": {1: 1.2, 2: 1.0, 3: 0.8},
        "type_mult": {"public": 0.35, "private": 1.35, "trust": 0.95}
    },
    "gallbladder_removal": {
        "base": 55000,
        "tier_mult": {1: 1.2, 2: 1.0, 3: 0.8},
        "type_mult": {"public": 0.35, "private": 1.3, "trust": 0.9}
    },
    "hernia_repair": {
        "base": 40000,
        "tier_mult": {1: 1.2, 2: 1.0, 3: 0.8},
        "type_mult": {"public": 0.3, "private": 1.3, "trust": 0.9}
    },

    # Cardiology
    "angioplasty": {
        "base": 250000,
        "tier_mult": {1: 1.3, 2: 1.0, 3: 0.8},
        "type_mult": {"public": 0.4, "private": 1.25, "trust": 0.9}
    },
    "bypass_surgery": {
        "base": 350000,
        "tier_mult": {1: 1.3, 2: 1.0, 3: 0.8},
        "type_mult": {"public": 0.4, "private": 1.2, "trust": 0.9}
    },
    "pacemaker": {
        "base": 250000,
        "tier_mult": {1: 1.2, 2: 1.0, 3: 0.8},
        "type_mult": {"public": 0.45, "private": 1.2, "trust": 0.9}
    },

    # Obstetrics
    "maternity_normal": {
        "base": 25000,
        "tier_mult": {1: 1.3, 2: 1.0, 3: 0.7},
        "type_mult": {"public": 0.15, "private": 1.5, "trust": 0.8}
    },
    "maternity_c_section": {
        "base": 50000,
        "tier_mult": {1: 1.3, 2: 1.0, 3: 0.75},
        "type_mult": {"public": 0.2, "private": 1.5, "trust": 0.85}
    },

    # Oncology
    "cancer_surgery": {
        "base": 300000,
        "tier_mult": {1: 1.4, 2: 1.0, 3: 0.85},
        "type_mult": {"public": 0.45, "private": 1.25, "trust": 0.9}
    },
    "chemotherapy_cycle": {
        "base": 35000,
        "tier_mult": {1: 1.2, 2: 1.0, 3: 0.85},
        "type_mult": {"public": 0.4, "private": 1.3, "trust": 0.9}
    },

    # Neurology
    "brain_surgery": {
        "base": 400000,
        "tier_mult": {1: 1.4, 2: 1.0, 3: 0.85},
        "type_mult": {"public": 0.45, "private": 1.2, "trust": 0.9}
    },

    # Urology
    "kidney_stone_removal": {
        "base": 40000,
        "tier_mult": {1: 1.2, 2: 1.0, 3: 0.8},
        "type_mult": {"public": 0.3, "private": 1.35, "trust": 0.9}
    },
    "dialysis": {
        "base": 3000,  # per session
        "tier_mult": {1: 1.2, 2: 1.0, 3: 0.8},
        "type_mult": {"public": 0.3, "private": 1.4, "trust": 0.9}
    },

    # Dental
    "root_canal": {
        "base": 8000,
        "tier_mult": {1: 1.3, 2: 1.0, 3: 0.75},
        "type_mult": {"public": 0.3, "private": 1.5, "trust": 0.95}
    },
    "dental_implant": {
        "base": 35000,
        "tier_mult": {1: 1.4, 2: 1.0, 3: 0.75},
        "type_mult": {"public": 0.4, "private": 1.4, "trust": 0.95}
    },
}

# Map of fuzzy matches -> canonical keys
FUZZY_MAP = {
    "knee": "knee_replacement",
    "hip": "hip_replacement",
    "spine": "spine_surgery",
    "back": "spine_surgery",
    "cataract": "cataract",
    "eye surgery": "cataract",
    "lasik": "lasik",
    "appendix": "appendectomy",
    "appendicitis": "appendectomy",
    "gallstone": "gallbladder_removal",
    "gallbladder": "gallbladder_removal",
    "hernia": "hernia_repair",
    "heart attack": "angioplasty",
    "angioplasty": "angioplasty",
    "bypass": "bypass_surgery",
    "heart surgery": "bypass_surgery",
    "pacemaker": "pacemaker",
    "delivery": "maternity_normal",
    "normal delivery": "maternity_normal",
    "c-section": "maternity_c_section",
    "cesarean": "maternity_c_section",
    "cancer": "cancer_surgery",
    "chemo": "chemotherapy_cycle",
    "chemotherapy": "chemotherapy_cycle",
    "brain": "brain_surgery",
    "kidney stone": "kidney_stone_removal",
    "dialysis": "dialysis",
    "root canal": "root_canal",
    "dental": "dental_implant",
}


class CostPredictor:
    def predict(self, procedure, city_tier, hospital_type, age):
        # Normalize
        proc_key = procedure.lower().strip().replace(" ", "_").replace("-", "_")

        # Try direct match first
        data = MOCK_DATA.get(proc_key)

        # Try fuzzy map
        if not data:
            for fuzzy, canonical in FUZZY_MAP.items():
                if fuzzy in procedure.lower():
                    data = MOCK_DATA.get(canonical)
                    proc_key = canonical
                    break

        if not data:
            # Generic fallback
            base_cost = 60000
            tier_m = 1.0
            type_m = 1.0
        else:
            base_cost = data["base"]
            tier_m = data["tier_mult"].get(city_tier, 1.0)
            type_m = data["type_mult"].get(hospital_type, 1.0)

        # Age factor: slightly higher for elderly (>50)
        age_mult = 1.0 + (max(0, age - 45) * 0.006)

        estimated = base_cost * tier_m * type_m * age_mult

        return {
            "low": int(estimated * 0.85),
            "mid": int(estimated),
            "high": int(estimated * 1.35),
            "currency": "INR",
            "procedure_key": proc_key
        }


predictor = CostPredictor()


def get_cost_prediction(procedure, city_tier, hospital_type, age):
    return predictor.predict(procedure, city_tier, hospital_type, age)
