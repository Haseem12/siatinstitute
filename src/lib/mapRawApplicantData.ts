import type { NewIntakeApplicationData } from "@/types";

/**
 * Maps raw API data from various sources (applications, pre_registered_users, users tables)
 * into a consistent NewIntakeApplicationData object for the frontend.
 */
export const mapRawApplicantData = (app: any): NewIntakeApplicationData => {
    // 1. Construct Full Name from various possible keys
    let fullNameConstructed = app.full_name || app.fullName || "";
    
    // If full name is still empty, try building it from parts
    if (!fullNameConstructed && (app.surname || app.firstname)) {
        fullNameConstructed = [
            app.surname || "",
            app.firstname || "",
            app.othername || ""
        ].filter(Boolean).join(" ").trim();
    }

    return {
        applicationId: String(app.application_id || app.applicationId || ""),
        fullName: fullNameConstructed,
        email: app.email || "",
        phoneNumber: app.phone_number || app.phoneNumber || "",
        dateOfBirth: app.date_of_birth ? new Date(app.date_of_birth) : undefined,
        gender: app.gender || "",
        address: app.address || "",
        city: app.city || "",
        stateOfOrigin: app.state_of_origin || app.stateOfOrigin || "",
        nationality: app.nationality || "Nigerian",
        
        // Handle photograph metadata
        photograph: app.photograph_name 
            ? { 
                name: app.photograph_name, 
                type: app.photograph_type, 
                size: parseInt(String(app.photograph_size || 0), 10) 
              } 
            : (app.photograph || null),

        nextOfKinName: app.next_of_kin_name || app.nextOfKinName || "",
        nextOfKinPhone: app.next_of_kin_phone || app.nextOfKinPhone || "",
        nextOfKinRelationship: app.next_of_kin_relationship || app.nextOfKinRelationship || "",
        
        preferredProgram: app.preferred_program || app.preferredProgram || "",
        preferredCampus: app.preferred_campus || app.preferredCampus || "",
        entryMode: app.entry_mode || app.entryMode || "",
        
        admissionStatus: app.admission_status || app.admissionStatus || "Not Submitted",
        rejectionReason: app.rejection_reason || app.rejectionReason,
        admission_number: app.admission_number || app.admissionNumber || undefined,
        submitted_at: app.submitted_at ? new Date(app.submitted_at) : undefined,
        
        // Extended fields for User profile consistency
        department: app.department || undefined,
        level: app.level || undefined,
        
        // Map O-Levels
        oLevels: (app.oLevels || []).map((ol: any) => ({
            id: String(ol.id || crypto.randomUUID()),
            examType: ol.exam_type || ol.examType || "", 
            examYear: ol.exam_year || ol.examYear || "", 
            examNumber: ol.exam_number || ol.examNumber || "",
            subjects: (ol.subjects || []).map((s: any) => ({ 
                id: String(s.id || crypto.randomUUID()),
                subject: s.subject_name || s.subject || "",
                grade: s.grade || ""
            })),
            file: ol.certificate_file_name 
                ? { 
                    name: ol.certificate_file_name, 
                    type: ol.certificate_file_type, 
                    size: parseInt(String(ol.certificate_file_size || 0), 10) 
                  } 
                : (ol.file || null),
        })),
        
        // Map A-Levels
        aLevels: (app.aLevels || []).map((al: any) => ({
            id: String(al.id || crypto.randomUUID()),
            type: al.qualification_type || al.type || "", 
            institution: al.institution || "",
            courseOfStudy: al.course_of_study || al.courseOfStudy || "", 
            gradeOrClass: al.grade_or_class || al.gradeOrClass || "",   
            yearAwarded: al.year_awarded || al.yearAwarded || "",     
            file: al.certificate_file_name 
                ? { 
                    name: al.certificate_file_name, 
                    type: al.certificate_file_type, 
                    size: parseInt(String(al.certificate_file_size || 0), 10) 
                  } 
                : (al.file || null),
        })),
        
        // Map Experiences
        experiences: (app.experiences || []).map((exp: any) => ({
            id: String(exp.id || crypto.randomUUID()),
            organization: exp.organization || "",
            role: exp.role || "",
            startDate: exp.start_date || exp.startDate || "",
            endDate: exp.end_date || exp.endDate || "",
            file: exp.document_file_name 
                ? { 
                    name: exp.document_file_name, 
                    type: exp.document_file_type, 
                    size: parseInt(String(exp.document_file_size || 0), 10) 
                  } 
                : (exp.file || null),
        })),
    };
};