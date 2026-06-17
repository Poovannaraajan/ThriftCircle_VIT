from marshmallow import Schema, fields, validate

class CreateListingSchema(Schema):
    title = fields.String(required=True, validate=validate.Length(min=3, max=120))
    description = fields.String(load_default=None, validate=validate.Length(max=2000))
    price = fields.Decimal(places=2, load_default=None, allow_none=True, validate=validate.Range(min=0))
    listing_type = fields.String(required=True, validate=validate.OneOf(["sell", "lend", "free"]))
    rental_period = fields.String(load_default=None, allow_none=True, validate=validate.OneOf(["day", "week", "month"]))
    condition = fields.String(load_default=None, allow_none=True, validate=validate.OneOf(["new", "like_new", "good", "fair", "poor"]))
    category_id = fields.Integer(required=True)

class ListingFilterSchema(Schema):
    page = fields.Integer(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Integer(load_default=20, validate=validate.Range(min=1, max=100))
    category_id = fields.Integer(load_default=None, allow_none=True)
    listing_type = fields.String(load_default=None, allow_none=True, validate=validate.OneOf(["sell", "lend", "free"]))
    min_price = fields.Decimal(load_default=None, allow_none=True)
    max_price = fields.Decimal(load_default=None, allow_none=True)
    q = fields.String(load_default=None, allow_none=True)
    status = fields.String(load_default="active", allow_none=True)
