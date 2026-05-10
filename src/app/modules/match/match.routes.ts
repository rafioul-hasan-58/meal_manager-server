import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { MatchValidation } from "./match.validation";
import { MatchController } from "./match.controller";

const router = Router({ mergeParams: true });


router.post(
  "/add-member",
  auth(),
  validateRequest(MatchValidation.addMemberSchema),
  MatchController.addMember
);

router.post(
  "/bulk",
  auth(),
  validateRequest(MatchValidation.addMultipleMembersSchema),
  MatchController.addMultipleMembers
);

// ── Read ──────────────────────────────────────────────────────────────────────

// GET /match/:matchId/members
router.get("/", auth(), MatchController.getAllMembers);

// GET /match/:matchId/members/:userId
router.get("/:userId", auth(), MatchController.getSingleMember);

// ── Update ────────────────────────────────────────────────────────────────────

// PATCH /match/:matchId/members/:userId/role
router.patch(
  "/:userId/role",
  auth(),
  validateRequest(MatchValidation.updateMemberRoleSchema),
  MatchController.updateMemberRole
);

// PATCH /match/:matchId/members/:userId/status
router.patch(
  "/:userId/status",
  auth(),
  validateRequest(MatchValidation.updateMemberStatusSchema),
  MatchController.updateMemberStatus
);

// ── Remove ────────────────────────────────────────────────────────────────────
router.delete(
  "/remove-member/:userId",
  auth(),
  validateRequest(MatchValidation.removeMemberSchema),
  MatchController.removeMember
);

router.delete(
  "/remove-members",
  auth(),
  validateRequest(MatchValidation.removeManyMembersSchema),
  MatchController.removeManyMembers
);

export const MatchRoutes = router;