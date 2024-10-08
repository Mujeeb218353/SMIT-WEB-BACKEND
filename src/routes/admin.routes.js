import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdminJWT } from "../middlewares/admin.auth.middleware.js";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAccessToken,
  updateAdminProfile,
  updateAdminDetails,
  inActiveAdmin,
  activeAdmin,
  updateAdminPassword,
  forgotPassword,
  getAdmins,
  adminVerificationStatus,
} from "../controllers/admin.controllers.js";
import { 
  createHeroSectionPost, 
  deleteHeroSectionPost, 
  getHeroSectionPosts, 
  updateHeroSectionPostDetails,
  updateHeroSectionPostPicture,
} from "../controllers/hero.section.controllers.js";
import {
  getAboutUsSectionPost,
  createAboutUsSectionPost,
  updateAboutUsSectionPostPicture,
  updateAboutUsSectionPostDetails,
  deleteAboutUsSectionPost,
} from "../controllers/about.us.controllers.js";
import { 
  getCountries, 
  createCountries, 
  updateCountries, 
  deleteCountries 
} from "../controllers/country.controllers.js";
import {
  getCities,
  createCity,
  updateCity,
  deleteCity,
} from "../controllers/city.controllers.js"
import {
  getCampuses,
  createCampus,
  updateCampusDetails,
  updateCampusPicture,
  addCampusPicture,
  deleteCampusPicture,
  deleteCampus,
} from "../controllers/campus.controllers.js";
import {
  getManagers,
  createManager,
  updateManagerPicture,
  updateManagerDetails,
  deleteManager,
} from "../controllers/manager.controllers.js";
import {
  getStaffMembers,
  createStaffMember,
  updateStaffMemberPicture,
  updateStaffMemberDetails,
  deleteStaffMember,
} from "../controllers/staff.member.controllers.js";
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "../controllers/category.controllers.js";
import {
  getCourses,
  createCourse,
  updateCourseDetails,
  updateCoursePicture,
  deleteCourse,
} from "../controllers/course.controllers.js";

const router = Router();

//* 1- Public Routes

router.route("/login").post(loginAdmin);

//* 2- Secure Routes

//! 1- Admin Operations
router.route("/register").post(verifyAdminJWT, upload.single("profile"), registerAdmin);
router.route("/logout").post(verifyAdminJWT, logoutAdmin);
router.route("/refreshAccessToken").get(verifyAdminJWT, refreshAccessToken);
router.route("/updateAdminProfile").put(verifyAdminJWT, upload.single("profile"), updateAdminProfile);
router.route("/updateAdminDetails").put(verifyAdminJWT, updateAdminDetails);
router.route("/inActiveAdmin/:adminId").put(verifyAdminJWT, inActiveAdmin);
router.route("/activeAdmin/:adminId").put(verifyAdminJWT, activeAdmin);
router.route("/updateAdminPassword/:newPassword").put(verifyAdminJWT, updateAdminPassword);
router.route("/verifyAdmin/:adminId").put(verifyAdminJWT, adminVerificationStatus)
router.route("/getAdmins").get(verifyAdminJWT, getAdmins);
router.route("/forgotPassword").get(verifyAdminJWT, forgotPassword);//not tested and completed yet

//! 2- Hero Section Operations
router.route("/getHeroSectionPosts").get(verifyAdminJWT, getHeroSectionPosts);
router.route("/createHeroSectionPost").post(verifyAdminJWT, upload.single("image"), createHeroSectionPost);
router.route("/updateHeroSectionPostPicture/:postId").put(verifyAdminJWT, upload.single("image"), updateHeroSectionPostPicture);
router.route("/updateHeroSectionPostDetails/:postId").put(verifyAdminJWT, updateHeroSectionPostDetails);
router.route("/deleteHeroSectionPost/:postId").delete(verifyAdminJWT, deleteHeroSectionPost);

//! 3- About Us Section Operations
router.route("/getAboutUsSectionPost").get(verifyAdminJWT, getAboutUsSectionPost);
router.route("/createAboutUsSectionPost").post(verifyAdminJWT, upload.single("image"), createAboutUsSectionPost);
router.route("/updateAboutUsSectionPostPicture/:postId").put(verifyAdminJWT, upload.single("image"),  updateAboutUsSectionPostPicture);
router.route("/updateAboutUsSectionPostDetails/:postId").put(verifyAdminJWT, updateAboutUsSectionPostDetails);
router.route("/deleteAboutUsSectionPost/:postId").delete(verifyAdminJWT, deleteAboutUsSectionPost);

//! 4- Country Operations
router.route("/getCountries").get(verifyAdminJWT, getCountries);
router.route("/createCountry").post(verifyAdminJWT, createCountries);
router.route("/updateCountry/:countryId").put(verifyAdminJWT, updateCountries);
router.route("/deleteCountry/:countryId").delete(verifyAdminJWT, deleteCountries);

//! 5- City Operations
router.route("/getCities").get(verifyAdminJWT, getCities);
router.route("/createCity").post(verifyAdminJWT, createCity);
router.route("/updateCity/:cityId").put(verifyAdminJWT, updateCity);
router.route("/deleteCity/:cityId").delete(verifyAdminJWT, deleteCity);

//! 6- Campus Operations
router.route("/getCampuses").get(verifyAdminJWT, getCampuses);
router.route("/createCampus").post(verifyAdminJWT, upload.fields([{name: "images"}]),createCampus);
router.route("/updateCampusDetails/:campusId").put(verifyAdminJWT, updateCampusDetails);
router.route("/updateCampusPicture/:campusId").put(verifyAdminJWT, upload.single("image"), updateCampusPicture);
router.route("/addCampusPicture/:campusId").put(verifyAdminJWT, upload.single("image"), addCampusPicture);
router.route("/deleteCampusPicture/:campusId").put(verifyAdminJWT, deleteCampusPicture);
router.route("/deleteCampus/:campusId").delete(verifyAdminJWT, deleteCampus);

//! 7- Manager Operations
router.route("/getManagers").get(verifyAdminJWT, getManagers);
router.route("/createManager").post(verifyAdminJWT, upload.single("profile"), createManager);
router.route("/updateManagerPicture/:managerId").put(verifyAdminJWT, upload.single("profile"), updateManagerPicture);
router.route("/updateManagerDetails/:managerId").put(verifyAdminJWT, updateManagerDetails);
router.route("/deleteManager/:managerId").delete(verifyAdminJWT, deleteManager);

//! 8- Staff Operations
router.route("/getStaffMembers").get(verifyAdminJWT, getStaffMembers);
router.route("/createStaffMember").post(verifyAdminJWT, upload.single("profile"), createStaffMember);
router.route("/updateStaffMemberPicture/:staffMemberId").put(verifyAdminJWT, upload.single("profile"), updateStaffMemberPicture);
router.route("/updateStaffMemberDetails/:staffMemberId").put(verifyAdminJWT, updateStaffMemberDetails);
router.route("/deleteStaffMember/:staffMemberId").delete(verifyAdminJWT, deleteStaffMember);

//! 9- Category Operations
router.route("/getCategories").get(verifyAdminJWT, getCategories);
router.route("/createCategory").post(verifyAdminJWT, createCategory);
router.route("/updateCategory/:categoryId").put(verifyAdminJWT, updateCategory);
router.route("/deleteCategory/:categoryId").delete(verifyAdminJWT, deleteCategory);

//! 10- Courses Section Operations
router.route("/getCourses").get(verifyAdminJWT, getCourses);
router.route("/createCourse").post(verifyAdminJWT, upload.single("image"), createCourse);
router.route("/updateCoursePicture/:courseId").put(verifyAdminJWT, upload.single("image"), updateCoursePicture);
router.route("/updateCourseDetails/:courseId").put(verifyAdminJWT, updateCourseDetails);
router.route("/deleteCourse/:courseId").delete(verifyAdminJWT, deleteCourse);

//! 11- Latest News Section Operations


//! 12- Past News Section Operations


//! 13- Chairman Message Section Operations


//! 14- Chairman Educational Message Operations


//! 15- Instructors Section Operations


//! 16- Alumni Section Operations


//! 17- Contact Section Operations


//! 18- Current Course Operations


export default router;
