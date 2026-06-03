import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { prismaMock } from "src/test/prisma.mock";
import { AlcorythmService } from "../alcorythm/alcorythm.service";
import { MailService } from "src/common/mail/mail.service";
import { UsersService } from "./users.service";
import { UserRole } from "@generated/prisma/enums";

jest.mock("src/common/mail/mail.service", () => ({
  MailService: jest.fn().mockImplementation(() => ({
    validateEmailDomain: jest.fn().mockResolvedValue(true),
  })),
}));

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AlcorythmService, useValue: {} },
        {
          provide: MailService,
          useValue: { validateEmailDomain: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      name: "Test",
      email: "t@example.com",
      role: UserRole.ADULT,
    });
    prismaMock.user.update.mockResolvedValue({ id: 1 });
  });

  describe("updateProfile", () => {
    it("strips privileged fields from the patch", async () => {
      const updateSpy = jest
        .spyOn(service, "update")
        .mockResolvedValue({ id: 1 } as never);

      await service.updateProfile(1, {
        name: "Ada",
        role: "ADMIN",
        isSuspended: true,
        hasCompletedPlacement: false,
      } as never);

      expect(updateSpy).toHaveBeenCalledWith(1, { name: "Ada" });
    });

    it("allows marking placement complete", async () => {
      const updateSpy = jest
        .spyOn(service, "update")
        .mockResolvedValue({ id: 1 } as never);

      await service.updateProfile(1, {
        hasCompletedPlacement: true,
      });

      expect(updateSpy).toHaveBeenCalledWith(1, {
        hasCompletedPlacement: true,
      });
    });
  });

  describe("updateAsAdmin", () => {
    it("delegates to update with role coercion", async () => {
      const updateSpy = jest
        .spyOn(service, "update")
        .mockResolvedValue({ id: 1 } as never);

      await service.updateAsAdmin(1, { role: "TEACHER" } as never);

      expect(updateSpy).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ role: "TEACHER" }),
      );
    });
  });
});
