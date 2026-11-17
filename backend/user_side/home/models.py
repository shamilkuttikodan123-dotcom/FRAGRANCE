from django.db import models

class Banner(models.Model):
    title = models.CharField(max_length=255)
    image_url = models.URLField()
    link_url = models.URLField(blank=True, null=True)
    is_hero_banner = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title